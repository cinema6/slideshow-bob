import {EventEmitter} from 'events';
import Mixable from './Mixable.js';
import eventDelegator from '../event_delegator.js';
import Runner from '../Runner.js';
import {createKey} from 'private-parts';
import {
    forEach,
    filter
} from '../utils.js';

let counter = 0;

export const views = new WeakMap();

const _ = createKey({
    queueSetAttribute: function(attribute, value) {
        // If the attribute has already been queued to be set, just modify the existing instruction.
        let setLength = this.attributeSets.length;
        while (setLength--) {
            let set = this.attributeSets[setLength];
            if (!set) { continue; }

            if (set[0] === attribute) {
                return (set[1] = value);
            }
        }

        // If the attribute was set to be removed, don't remove it anymore.
        let removeIndex = this.attributeRemovals.indexOf(attribute);
        if (removeIndex > -1) { this.attributeRemovals[removeIndex] = null; }

        this.attributeSets.push([attribute, value]);
    },

    queueRemoveAttribute: function(attribute) {
        // If the attribute was queued to be set, don't set it anymore (because it will just be
        // removed.)
        let setLength = this.attributeSets.length;
        while (setLength--) {
            if (this.attributeSets[setLength][0] === attribute) {
                this.attributeSets[setLength] = null;
                break;
            }
        }
        // If the attribute was already queued to be removed, don't do anything.
        if (this.attributeRemovals.indexOf(attribute) > -1) { return; }

        this.attributeRemovals.push(attribute);
    }
});

function syncClassesWithElement() {
    if (!this.element) { return; }
    this.element.className = this.classes.join(' ');
}

function syncAttributesWithElement() {
    const { attributeSets, attributeRemovals } = _(this);
    let item;

    while ((item = attributeSets.pop()) !== undefined) {
        if (!item) { continue; }
        this.element.setAttribute(item[0], item[1]);
    }
    while ((item = attributeRemovals.pop()) !== undefined) {
        if (!item) { continue; }
        this.element.removeAttribute(item);
    }
}

class View extends Mixable {
    constructor(element) {
        super();

        if (element && views.get(element)) {
            const view = views.get(element);

            throw new Error(
                `Cannot create View because the provided ` +
                `element already belongs to [View:${view.id}].`
            );
        }

        _(this).attributeSets = [];
        _(this).attributeRemovals = [];

        this.tag = element ? element.tagName.toLowerCase() : undefined;
        this.id = (element && element.id) || `c6-view-${++counter}`;

        this.template = element ? element.innerHTML : '';
        this.element = element || null;

        this.classes = element && element.className ? element.className.split(' ') : [];
        this.classes.push('c6-view');
        this.attributes = {};
        forEach((element && element.attributes) || [], attribute => {
            this.attributes[attribute.name] = attribute.value;
        });

        this.inserted = false;

        this.target = null;
        this.action = null;
    }

    /***********************************************************************************************
     * METHODS
     **********************************************************************************************/
    create() {
        if (!this.tag) {
            throw new Error(
                `Cannot create element for [View:${this.id}] because 'tag' is undefined.`
            );
        }

        const element = this.element || document.createElement(this.tag);

        element.id = this.id;
        element.className = this.classes.join(' ');
        for (let attribute in this.attributes) {
            const value = this.attributes[attribute];

            element.setAttribute(attribute, value === true ? '' : value);
        }
        if (this.template !== element.innerHTML) {
            element.innerHTML = this.template;
        }

        this.element = element;
        this.didCreateElement();

        if (document.body.contains(element)) {
            this.didInsertElement();
        }

        return element;
    }

    appendTo(parent) {
        const element = this.element || this.create();
        const parentElement = parent.element || parent.create();

        Runner.schedule('render', null, () => {
            parentElement.appendChild(element);
            if (!this.inserted) {
                this.didInsertElement();
            }
        });
    }

    insertInto(parent, before = null) {
        const element = this.element || this.create();
        const parentElement = parent.element || parent.create();
        const beforeElement = before && before.element;

        Runner.schedule('render', null, () => {
            parentElement.insertBefore(element, beforeElement);
            if (!this.inserted) {
                this.didInsertElement();
            }
        });
    }

    append(child) {
        child.appendTo(this);
    }

    insert(child, sibling) {
        child.insertInto(this, sibling);
    }

    remove() {
        const {element} = this;

        if (!element) { return; }

        this.willRemoveElement();
        this.element = null;
        Runner.schedule('render', element.parentNode, 'removeChild', [element]);
    }

    addClass(className) {
        const index = this.classes.indexOf(className);

        if (index > -1) { return; }

        this.classes.push(className);
        Runner.scheduleOnce('render', this, syncClassesWithElement);
    }

    removeClass(className) {
        const index = this.classes.indexOf(className);

        if (index < 0) { return; }

        this.classes.splice(index, 1);
        Runner.scheduleOnce('render', this, syncClassesWithElement);
    }

    setAttribute(attribute, value) {
        if (this.attributes[attribute] === value) { return; }

        this.attributes[attribute] = value;

        if (this.element) {
            if (value === false) {
                _(this).queueRemoveAttribute(attribute);
            } else {
                _(this).queueSetAttribute(attribute, value === true ? '' : value);
            }

            Runner.scheduleOnce('render', this, syncAttributesWithElement);
        }
    }

    sendAction(...args) {
        const { target, action } = this;
        if (!target || !action) { return; }

        this.emit('action', target, action, args);
    }

    /***********************************************************************************************
     * HOOKS
     **********************************************************************************************/
    didCreateElement() {
        views.set(this.element, this);
        eventDelegator.addListeners(this, filter(eventDelegator.events, event => event in this));
    }

    didInsertElement() {
        this.inserted = true;
    }

    willRemoveElement() {
        views.delete(this.element);
        eventDelegator.removeListeners(this);
        this.removeAllListeners();
        this.inserted = false;
    }
}
View.mixin(EventEmitter);

export default View;
