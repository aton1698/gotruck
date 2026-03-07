<?php

namespace App\Exceptions;

use Fleetbase\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception. For 4xx on SMS/2FA auth routes, log to stdout
     * so you can see the error in the deployment terminal.
     */
    public function report(Throwable $e): void
    {
        if ($e instanceof HttpException && $e->getStatusCode() >= 400 && $e->getStatusCode() < 500) {
            $path = request()->path();
            if (str_contains($path, 'two-fa') || str_contains($path, 'onboard')) {
                Log::channel('stdout')->warning('[SMS Auth] Exception (4xx) on auth endpoint', [
                    'path'       => $path,
                    'status'     => $e->getStatusCode(),
                    'message'    => $e->getMessage(),
                    'trace'      => $e->getTraceAsString(),
                ]);
            }
        }

        parent::report($e);
    }
}
