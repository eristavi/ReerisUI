export const documentationSections = [
  {
    title: 'Foundation',
    description: 'Tokens, themes, layout, utilities and platform contracts.',
    pages: [
      ['foundation.html', 'Foundation', 'Design tokens, themes, typography, spacing and layout primitives.'],
      ['themes.html', 'Themes & validation', 'Partial/nested themes, semantic contrast pairs and the custom-theme validator.'],
      ['button.html', 'Buttons & actions', 'Buttons, groups, split actions, close controls and FABs.'],
      ['forms-complete.html', 'Forms', 'Complete native-first form system and validation patterns.'],
      ['surfaces.html', 'Surfaces & content', 'Cards, panels, badges, chips, avatars and content states.'],
      ['feedback.html', 'Feedback & status', 'Alerts, progress, meters, spinners and skeletons.'],
      ['toast.html', 'Toasts', 'Transient feedback presentation and lifecycle boundary.']
    ]
  },
  {
    title: 'Navigation & overlays',
    description: 'Navigation, disclosure and top-layer presentation.',
    pages: [
      ['navigation.html', 'Navigation foundation', 'Navbar, tabs, breadcrumbs, pagination and steps.'],
      ['advanced-navigation.html', 'Advanced navigation', 'Sidebar, navigation groups and mobile navigation.'],
      ['navigation-completion.html', 'Navigation completion', 'Responsive navbar, mega menu, hover cards and glide navigation.'],
      ['overlays.html', 'Overlays & disclosure', 'Dialogs, popovers, drawers, accordions and tooltips.'],
      ['search-command.html', 'Search & command', 'Command palette, search results and combobox presentation.'],
      ['tree.html', 'Tree & hierarchy', 'Hierarchical navigation and tree presentation.']
    ]
  },
  {
    title: 'Data & application patterns',
    description: 'Reusable compositions for application interfaces.',
    pages: [
      ['tables.html', 'Tables', 'Semantic and responsive table presentation.'],
      ['data-display.html', 'Lists & activity', 'Lists, timelines, activity feeds and metrics.'],
      ['app-shell.html', 'Application shell', 'Sidebar, topbar, workspace and dashboard composition.'],
      ['toolbar-filters.html', 'Toolbars & filters', 'Page actions, filters, search and view controls.'],
      ['visualization.html', 'Metrics & visualization', 'KPI, bars, rings, legends and chart containers.'],
      ['workflow.html', 'Workflow', 'Steppers, status flows and wizard compositions.'],
      ['settings.html', 'Settings', 'Preference, account, security and danger-zone patterns.']
    ]
  },
  {
    title: 'Content & product patterns',
    description: 'Content-heavy and product-oriented compositions built from Core.',
    pages: [
      ['media.html', 'Media', 'Figures, media objects, galleries and lightbox presentation.'],
      ['identity.html', 'Identity', 'Profiles, users, teams and presence.'],
      ['marketing.html', 'Marketing', 'Hero, feature, pricing, testimonial and CTA patterns.'],
      ['authentication.html', 'Authentication', 'Authentication and onboarding compositions.'],
      ['messaging.html', 'Messaging', 'Notifications, inboxes and conversation presentation.'],
      ['files.html', 'Files & upload', 'File browser, uploads and attachment presentation.'],
      ['commerce.html', 'Commerce', 'Cart, transaction, payment and invoice presentation.'],
      ['choice.html', 'Choice & rating', 'Selectable cards, ratings, reactions and voting.']
    ]
  },
  {
    title: 'Official starters',
    description: 'Reference compositions that test Reeris Core as a complete system.',
    pages: [
      ['starters.html', 'Official starters', 'Dashboard, data management, authentication, settings and marketing reference compositions.']
    ]
  },
  {
    title: 'Quality & release evidence',
    description: 'Acceptance reports and reproducible hardening fixtures.',
    pages: [
      ['browser-reflow.html', 'Browser & reflow fixture', 'Canonical keyboard, zoom, translation and reflow stress page.'],
      ['content-states.html', 'Content states', 'Reusable empty/error/offline/permission/maintenance states.'],
      ['security-package-release.html', 'Security & package release', 'CSP, package integrity, vulnerability policy and release hardening.'],
      ['build-reproducibility.html', 'Build reproducibility & source maps', 'Deterministic builds, published source modules and CSS source-map acceptance.'],
      ['visual-regression.html', 'Visual regression fixture', 'Canonical theme, density, RTL, personality and viewport visual matrix.'],
      ['release-candidate-readiness.html', 'Release candidate readiness', 'API freeze, automated RC gate and remaining manual/external release gates.'],
      ['release-lab.html', 'Release Lab evidence', 'Evidence capture, approval, gate criteria and deterministic gate closure.'],
      ['external-release-lab.html', 'External Release Lab', 'Twenty-one criterion-specific field test packs for closing real browser, device, assistive-tech and launch gates.'],
      ['local-chromium-evidence-0.49.md', 'Local Chromium evidence', 'First real RC render/interaction capture, stored as non-closing supplemental evidence.']
    ]
  }
];

export const sourceDocumentation = {
  'reeris.css': 'foundation.html',
  'core/layers.css': 'foundation.html',
  'core/reset.css': 'foundation.html',
  'core/base.css': 'foundation.html',
  'core/theme.css': 'foundation.html',
  'core/personality.css': 'foundation.html',
  'tokens/generated.css': 'foundation.html',
  'layout/primitives.css': 'foundation.html',
  'utilities/accessibility.css': 'foundation.html',
  'utilities/utilities.css': 'foundation.html',
  'forms/forms.css': 'forms-complete.html',
  'components/button.css': 'button.html',
  'components/surfaces.css': 'surfaces.html',
  'components/feedback.css': 'feedback.html',
  'components/toast.css': 'toast.html',
  'components/navigation.css': 'navigation.html',
  'components/advanced-navigation.css': 'advanced-navigation.html',
  'components/navigation-extended.css': 'navigation-completion.html',
  'components/overlays.css': 'overlays.html',
  'components/tables.css': 'tables.html',
  'components/data-display.css': 'data-display.html',
  'components/app-shell.css': 'app-shell.html',
  'components/toolbar-filters.css': 'toolbar-filters.html',
  'components/visualization.css': 'visualization.html',
  'components/workflow.css': 'workflow.html',
  'components/media.css': 'media.html',
  'components/identity.css': 'identity.html',
  'components/marketing.css': 'marketing.html',
  'components/settings.css': 'settings.html',
  'components/authentication.css': 'authentication.html',
  'components/messaging.css': 'messaging.html',
  'components/files.css': 'files.html',
  'components/commerce.css': 'commerce.html',
  'components/search-command.css': 'search-command.html',
  'components/tree.css': 'tree.html',
  'components/choice.css': 'choice.html'
};
