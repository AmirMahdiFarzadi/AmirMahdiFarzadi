const listeners = new Map();

export function subscribe(key, callback) {

    if (!listeners.has(key)) {
        listeners.set(key, []);
    }

    listeners.get(key).push(callback);


    return () => {

        const callbacks = listeners.get(key);

        if (!callbacks) return;

        const index = callbacks.indexOf(callback);

        if (index !== -1) {
            callbacks.splice(index, 1);
        }

    };

}

export function notify(key, value) {

    const callbacks = listeners.get(key);

    if (!callbacks) return;

    callbacks.forEach(callback => callback(value));

}