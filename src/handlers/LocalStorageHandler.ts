const stateKey = "Kod-lab-rhex-state";

export const stateExists = () => window.localStorage.getItem(stateKey) != null;
export const getStoredState = () => {
    const jsonString = window.localStorage.getItem(stateKey);
    return jsonString ? JSON.parse(jsonString) : null;
}
export const storeState = (path, state) => window.localStorage.setItem(stateKey, JSON.stringify({path, state, date: Date.now()}));
export const removeStoredState = () => window.localStorage.removeItem(stateKey);
