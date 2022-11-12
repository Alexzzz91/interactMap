
export function loadFromStorage(domain, storage) {
    return domain.onCreateStore(store => {
        const key = `${domain.shortName}/${store.shortName}`;
        const raw = storage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        store.setState(parsed);
    });
}
  
export function saveToStorage(domain, storage) {
    return domain.onCreateStore(store => {
        const key = `${domain.shortName}/${store.shortName}`;
        store.watch(value => {
        storage.setItem(
            key,
            JSON.stringify(value),
        );
        });
    });
}