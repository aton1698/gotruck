import { schedule } from '@ember/runloop';

const PLACEHOLDER_TEXT = 'Select a storefront';

/**
 * Hides the "Launch App" menu item from the Storefront section in the sidebar.
 */
function hideLaunchAppItem() {
    const sidebar = document.getElementById('sidebar-menu-items');
    if (!sidebar) return;

    sidebar.querySelectorAll('a, [role="menuitem"], .next-dd-item').forEach((el) => {
        if (el.textContent?.trim().replace(/\s+/g, ' ').includes('Launch App')) {
            const item = el.closest('li') || el.closest('.layout-sidebar-item') || el;
            item.style.setProperty('display', 'none', 'important');
        }
    });
}

/**
 * Finds the storefront selector trigger (the button that shows "Test" or current storefront name).
 * It's the first prominent button at the top of the sidebar, outside #sidebar-menu-items.
 */
function getStorefrontSelectorTrigger() {
    const inner = document.querySelector('.next-sidebar-content-inner');
    if (!inner) return null;
    const menu = document.getElementById('sidebar-menu-items');
    for (const child of inner.children) {
        if (child === menu) break;
        const btn = child.querySelector('button, [role="button"]') || (child.tagName === 'BUTTON' ? child : null);
        if (btn) return btn;
    }
    return null;
}

/**
 * Updates the storefront selector placeholder text when no storefront is selected.
 * Storefront button in the header bar is always shown.
 */
function updateStorefrontUI() {
    const trigger = getStorefrontSelectorTrigger();
    const triggerText = trigger?.textContent?.trim().replace(/\s+/g, ' ') || '';

    if (trigger) {
        const isPlaceholder = !triggerText || /^select\s+(a\s+)?storefront$/i.test(triggerText) || /^select\s+store$/i.test(triggerText);
        if (isPlaceholder) {
            const labelSpan = trigger.querySelector('span:first-of-type, [class*="label"]');
            if (labelSpan) {
                labelSpan.textContent = PLACEHOLDER_TEXT;
            } else {
                const firstText = Array.from(trigger.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
                if (firstText) firstText.textContent = PLACEHOLDER_TEXT;
                else if (trigger.textContent?.trim() !== PLACEHOLDER_TEXT) trigger.textContent = PLACEHOLDER_TEXT;
            }
        }
    }
}

function runStorefrontUI() {
    hideLaunchAppItem();
    updateStorefrontUI();
}

export function initialize() {
    schedule('afterRender', () => {
        runStorefrontUI();

        const sidebar = document.getElementById('sidebar-menu-items');
        const sidebarInner = document.querySelector('.next-sidebar-content-inner');

        const observe = () => {
            if (sidebar && !sidebar.dataset.storefrontUiObserver) {
                sidebar.dataset.storefrontUiObserver = '1';
                const observer = new MutationObserver(() => runStorefrontUI());
                observer.observe(sidebar, { childList: true, subtree: true });
            }
            if (sidebarInner && !sidebarInner.dataset.storefrontUiObserver) {
                sidebarInner.dataset.storefrontUiObserver = '1';
                const observer2 = new MutationObserver(() => runStorefrontUI());
                observer2.observe(sidebarInner, { childList: true, subtree: true });
            }
        };

        observe();
        setTimeout(observe, 300);
        setTimeout(runStorefrontUI, 500);
        setTimeout(runStorefrontUI, 1500);
    });
}

export default {
    name: 'hide-storefront-launch-app',
    after: 'setup-extensions',
    initialize,
};
