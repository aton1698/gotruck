<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Logs every request/response for SMS and 2FA authentication endpoints
 * so you can debug "Unable to send SMS Verification code" and 400 errors
 * in the deployment terminal (logs go to stdout when LOG_CHANNEL=stdout).
 */
class LogSmsAuthRequests
{
    /** @var string[] Paths that trigger detailed SMS auth logging */
    protected array $authPaths = [
        'two-fa/validate',
        'two-fa/resend',
        'two-fa/verify',
        'two-fa/invalidate',
        'onboard/send-verification-sms',
        'onboard/send-verification-email',
        'auth/create-verification-session',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        $isAuthPath = $this->isSmsAuthPath($path);

        if (!$isAuthPath) {
            return $next($request);
        }

        $step = '[SMS Auth]';
        // Always log to stdout so you see these in the deployment terminal (e.g. AWS)
        $logger = Log::channel('stdout');

        // Step 1: Request received
        $logger->info("{$step} [1/3] Request received", [
            'method' => $request->method(),
            'path'   => $path,
            'body'   => $this->sanitizeBody($request->all()),
        ]);

        $response = $next($request);

        // Step 2: Response status
        $status = $response->getStatusCode();
        $logger->info("{$step} [2/3] Response status", [
            'path'   => $path,
            'status' => $status,
        ]);

        // Step 3: On error, log response body to help debug 400
        if ($status >= 400) {
            $content = $response->getContent();
            $decoded = @json_decode($content, true);
            $logger->warning("{$step} [3/3] Error response body (debug)", [
                'path'    => $path,
                'status'  => $status,
                'body'    => $decoded ?: $content,
            ]);
        }

        return $response;
    }

    protected function isSmsAuthPath(string $path): bool
    {
        foreach ($this->authPaths as $authPath) {
            if (str_contains($path, $authPath)) {
                return true;
            }
        }
        return false;
    }

    /** Sanitize request body for logging (mask phone, session, tokens). */
    protected function sanitizeBody(array $body): array
    {
        $out = [];
        foreach ($body as $key => $value) {
            if (in_array($key, ['password', 'password_confirmation'], true)) {
                $out[$key] = '(redacted)';
                continue;
            }
            if ($key === 'phone' && is_string($value) && strlen($value) > 4) {
                $out[$key] = '***' . substr($value, -4);
                continue;
            }
            if (in_array($key, ['token', 'session', 'clientToken', 'hello'], true)) {
                $out[$key] = is_string($value) ? '(length=' . strlen($value) . ')' : '(present)';
                continue;
            }
            $out[$key] = $value;
        }
        return $out;
    }
}
