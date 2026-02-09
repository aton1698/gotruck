import { debug } from '@ember/debug';

/**
 * Register dashboard and widgets for FleetbaseConsole
 * Runs after extensions are loaded
 */
export function initialize(appInstance) {
    const widgetService = appInstance.lookup('service:universe/widget-service');

    debug('[Initializing Widgets] Registering console dashboard...');

    // Register the console dashboard (no default widgets - GitHub card and Fleetbase blog removed)
    widgetService.registerDashboard('dashboard');
}

export default {
    name: 'initialize-widgets',
    after: 'load-extensions',
    initialize,
};
