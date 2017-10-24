import 'clay-button';
import 'clay-icon';
import {Config} from 'metal-state';
import {EventHandler} from 'metal-events';
import Component from 'metal-component';
import dom from 'metal-dom';
import Soy from 'metal-soy';

import templates from './ClayModal.soy.js';

const KEY_CODE_ESC = 27;

/**
 * Metal ClayModal component.
 */
class ClayModal extends Component {
  /**
   * @inheritDoc
   */
  created() {
    this._overlayElement = this._valueOverlayElementFn();
    this._eventHandler = new EventHandler();
  }

  /**
   * @inheritDoc
   */
  attached() {
    this.addListener('click', this._handleDocumentClick.bind(this), true);
    this.addListener('hide', this._defaultHideModal, true);
    this.addListener('touchend', this._handleDocumentClick.bind(this), true);
    this.addListener('transitionend', this._handleTransitionEnd, true);
  }

  /**
   * @inheritDoc
   */
  detached() {
    super.detached();
    this._eventHandler.removeAllListeners();
  }

  /**
   * @inheritDoc
   */
  sync_visible() {
    if (this._visible) {
      dom.enterDocument(this._overlayElement);
      this._overlayElement.offsetHeight;
      dom.addClasses(this._overlayElement, 'show');
    } else {
      dom.exitDocument(this._overlayElement);
    }
  }

  sync_isTransitioning() {
    if (this._isTransitioning && !this._visible) {
      this._isTransitioning = false;
      this._visible = true;
    } else if (this._isTransitioning && this._visible) {
      this._visible = false;
    }
  }

  /**
   * Close modal and remove transitions.
   * @private
   */
  _defaultHideModal() {
    dom.removeClasses(this._overlayElement, 'show');
    dom.removeClasses(document.body, 'modal-open');

    this._isTransitioning = true;

    this._eventHandler.removeAllListeners();
  }

  /**
   * Handle the click and emit close modal.
   * @private
   */
  _handleCloseModal() {
    this.emit('hide');
  }

  /**
   * Handle the click buttons and emit event.
   * @private
   */
  _handleClickFooterButton(event) {
    this.emit('clickButton', event);
  }

  /**
   * Handle the footer close button click and emits events.
   * @private
   */
  _handleClickCloseButtonFooter(event) {
    this.emit('clickButton', event);
    this.emit('hide');
  }

  /**
   * Check if contain click target event in element and emit close modal.
   * @private
   */
  _handleDocumentClick() {
    if (dom.contains(event.target, this.element)) {
      this.emit('hide');
    }
  }

  /**
   * Handle click key code esc and emit close modal.
   * @param {Object} event
   * @private
   */
  _handleKeyup(event) {
    if (event.keyCode === KEY_CODE_ESC) {
      this.emit('hide');
    }
  }

  /**
   * Handle css transition ends.
   * @param {Object} event
   * @private
   */
  _handleTransitionEnd(event) {
    if (
      event.target === this.element &&
      this._isTransitioning &&
      !this._visible
    ) {
      this._isTransitioning = false;
    }
  }

  /**
   * Create fragment of the overlay modal.
   * @return {Element} The resulting document fragment.
   * @private
   */
  _valueOverlayElementFn() {
    return dom.buildFragment('<div class="modal-backdrop fade"></div>')
      .firstChild;
  }

  /**
   * Open modal and add transition.
   * @public
   */
  show() {
    dom.addClasses(document.body, 'modal-open');

    this._isTransitioning = true;

    this._eventHandler.add(
      dom.on(document, 'keyup', this._handleKeyup.bind(this))
    );
  }
}

/**
 * State definition.
 * @static
 * @type {!Object}
 */
ClayModal.STATE = {
  /**
   * Adds transitions when show is called.
   * @instance
   * @memberof ClayModal
   * @type {?bool}
   * @default false
   * @private
   */
  _isTransitioning: Config.bool()
    .value(false)
    .internal(),

  /**
   * Modal visible when show is called.
   * @instance
   * @memberof ClayModal
   * @type {?bool}
   * @default false
   * @private
   */
  _visible: Config.bool()
    .value(false)
    .internal(),

  /**
   * Body of the modal.
   * @instance
   * @memberof ClayModal
   * @type {?string|html|undefined}
   * @default undefined
   */
  body: Config.any(),

  /**
   * Buttons of the footer.
   * @instance
   * @memberof ClayModal
   * @type {?array|undefined}
   * @default undefined
   */
  footerButtons: Config.arrayOf(
    Config.shapeOf({
      alignment: Config.oneOf(['left', 'right']).value('right'),
      label: Config.string().required(),
      style: Config.oneOf([
        'borderless',
        'link',
        'primary',
        'secondary',
        'unstyled',
      ]),
      type: Config.oneOf(['button', 'close', 'reset', 'submit']).value('button'),
    })
  ),

  /**
   * Id to be applied to the element.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  id: Config.string(),

  /**
   * The size of element modal.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  size: Config.oneOf(['full-screen', 'lg', 'sm']),

  /**
   * The path to the SVG spritemap file containing the icons.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  spritemap: Config.string(),

  /**
   * Status messages.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  status: Config.oneOf(['danger', 'info', 'success', 'warning']),

  /**
   * Title of the modal.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  title: Config.string(),

  /**
   * Url to place an iframe in the body of the modal.
   * @instance
   * @memberof ClayModal
   * @type {?string|undefined}
   * @default undefined
   */
  url: Config.string(),
};

Soy.register(ClayModal, templates);

export {ClayModal};
export default ClayModal;
