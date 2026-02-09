import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { format as formatDateFns } from 'date-fns';

/**
 * Default translation keys for known metric titles (English label -> intl key).
 * Extend via options.titleTranslationKeys.
 */
export const DEFAULT_TITLE_TRANSLATION_KEYS = {
    Earnings: 'widget.key-metrics.earnings',
    'Fuel Costs': 'widget.key-metrics.fuel-costs',
    'Total Distance Traveled': 'widget.key-metrics.total-distance-traveled',
    'Orders Canceled': 'widget.key-metrics.orders-canceled',
    'Orders Completed': 'widget.key-metrics.orders-completed',
    'Orders In Progress': 'widget.key-metrics.orders-in-progress',
    'Orders Scheduled': 'widget.key-metrics.orders-scheduled',
    'Drivers Online': 'widget.key-metrics.drivers-online',
    'Total Drivers': 'widget.key-metrics.total-drivers',
    'Total Customers': 'widget.key-metrics.total-customers',
    'Open Issues': 'widget.key-metrics.open-issues',
    'Resolved Issues': 'widget.key-metrics.resolved-issues',
    'Total Products': 'storefront.component.widget.key-metrics.total-products',
    'Total Stores': 'storefront.component.widget.key-metrics.total-stores',
    'Total Networks': 'storefront.component.widget.key-metrics.total-networks',
};

/**
 * Default currency symbol used when formatting money. Override via options.currencySymbol.
 */
export const DEFAULT_CURRENCY_SYMBOL = '₡';

/**
 * Format a number as currency. Symbol first (e.g. "₡ 0.00"), no "US" or currency code.
 * Override in subclass or via options.formatters.money for full customization.
 */
export function formatCurrencyValue(value, currency = 'USD', currencySymbol = DEFAULT_CURRENCY_SYMBOL) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    try {
        const formatted = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
        return `${currencySymbol} ${formatted}`.trim();
    } catch {
        return `${currencySymbol} ${num.toFixed(2)}`.trim();
    }
}

/**
 * Format meters (e.g. to km with unit). Override via options.formatters.meters.
 */
export function formatMetersValue(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    if (num >= 1000) return `${(num / 1000).toFixed(1)}km`;
    return `${Math.round(num)}m`;
}

/**
 * Format bytes (e.g. to KB/MB/GB). Override via options.formatters.bytes.
 */
export function formatBytesValue(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let u = 0;
    let n = num;
    while (n >= 1024 && u < units.length - 1) {
        n /= 1024;
        u += 1;
    }
    return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

/**
 * Format duration in seconds to human string (e.g. "2h 30m"). Override via options.formatters.duration.
 */
export function formatDurationValue(value) {
    const sec = Number(value);
    if (Number.isNaN(sec)) return String(value ?? '');
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
}

/**
 * Format date value. Uses date-fns; format string from options.dateFormat (default 'PP').
 * Override via options.formatters.date.
 */
export function formatDateValue(value, dateFormat = 'PP') {
    if (value == null) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return formatDateFns(d, dateFormat);
}

/**
 * Dashboard count widget: shows a title and a formatted value (currency, meters, bytes, duration, date, or raw).
 *
 * Customization:
 * - options.currencySymbol: symbol for money format (default '₡').
 * - options.titleTranslationKeys: map of title string -> intl key (merged with defaults).
 * - options.formatters: { money, meters, bytes, duration, date } — functions to override formatting.
 * - Subclass and override formatMoneyValue, formatMetersValue, translateTitle, etc.
 */
export default class DashboardCountComponent extends Component {
    @service intl;

    @tracked title;
    @tracked value;

    constructor(owner, { options = {}, title, value = null }) {
        super(...arguments);
        this._options = options;
        const resolvedTitle = title ?? options?.title ?? '';
        const rawValue = value ?? options?.value ?? null;
        this.title = this.translateTitle(resolvedTitle, options);
        this.value = this.computeDisplayValueFromOptions(options, rawValue) ?? rawValue ?? null;
    }

    /**
     * Translate the title and return the string. Result is assigned to this.title.
     * Override in subclass or pass options.titleTranslationKeys to extend the map.
     */
    translateTitle(title, options) {
        if (!title) return title;
        const keyMap = { ...DEFAULT_TITLE_TRANSLATION_KEYS, ...(options.titleTranslationKeys || {}) };
        const key = keyMap[title];
        if (key) return this.intl.t(key);
        if (title.includes('.')) return this.intl.t(title);
        return title;
    }

    /**
     * Compute display value from options (format money, meters, etc.). Returns the value to show.
     * Single assignment in constructor avoids "update after use" assertion.
     */
    computeDisplayValueFromOptions(options, rawValue) {
        const { format, currency, dateFormat, value: optValue } = options;
        const val = rawValue ?? optValue;
        if (format == null) return val;

        const formatters = this.getFormatters(options);
        switch (format) {
            case 'money':
                return this.formatMoneyValue(optValue, currency, options.currencySymbol, formatters.money);
            case 'meters':
                return this.formatMetersValue(optValue, formatters.meters);
            case 'bytes':
                return this.formatBytesValue(optValue, formatters.bytes);
            case 'duration':
                return this.formatDurationValue(optValue, formatters.duration);
            case 'date':
                return this.formatDateValue(optValue, dateFormat, formatters.date);
            default:
                return val;
        }
    }

    /**
     * Return formatters map. options.formatters is merged over defaults so you can override only one.
     * Override to provide your own formatter set.
     */
    getFormatters(options) {
        const custom = options.formatters || {};
        return {
            money: custom.money || formatCurrencyValue,
            meters: custom.meters || formatMetersValue,
            bytes: custom.bytes || formatBytesValue,
            duration: custom.duration || formatDurationValue,
            date: custom.date || formatDateValue,
            ...custom,
        };
    }

    /**
     * Format money. Override in subclass or use options.formatters.money.
     */
    formatMoneyValue(value, currency, currencySymbol, formatter) {
        const symbol = currencySymbol ?? this._options?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL;
        return formatter(value, currency, symbol);
    }

    /**
     * Format meters. Override in subclass or use options.formatters.meters.
     */
    formatMetersValue(value, formatter) {
        return formatter(value);
    }

    /**
     * Format bytes. Override in subclass or use options.formatters.bytes.
     */
    formatBytesValue(value, formatter) {
        return formatter(value);
    }

    /**
     * Format duration. Override in subclass or use options.formatters.duration.
     */
    formatDurationValue(value, formatter) {
        return formatter(value);
    }

    /**
     * Format date. Override in subclass or use options.formatters.date.
     */
    formatDateValue(value, dateFormat, formatter) {
        return formatter(value, dateFormat);
    }
}
