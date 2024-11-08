# WooCommerce Product Editor UI Store

This module provides a @wordpress/data store for managing the UI state of a WooCommerce Product Editor.

## Structure

Defines action types for the UI state:

-   `ACTION_MODAL_EDITOR_OPEN`
-   `ACTION_MODAL_EDITOR_CLOSE`
-   `ACTION_PANEL_PREPUBLISH_OPEN`
-   `ACTION_PANEL_PREPUBLISH_CLOSE`

### Actions

-   `openModalEditor`
-   `closeModalEditor`
-   `openPrepublishPanel`
-   `closePrepublishPanel`

### Selectors

Selector function:

-   `isModalEditorOpen`
-   `isPrepublishPanelOpen`

### Store

Registers the WooCommerce Product Editor UI store with the following:

-   Store Name: `woo/product-editor-ui`

## Usage
