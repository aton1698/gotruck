/**
 * Widget count: reuses dashboard/count so key-metrics cards get
 * translated titles, ₡ currency, and bluish background without depending on ember-ui implementation.
 * When the engine renders "widget/count", this app component is used instead of the addon's.
 */
import DashboardCountComponent from '../dashboard/count';

export default class WidgetCountComponent extends DashboardCountComponent {}
