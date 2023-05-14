export const sortObjectKeys = function (object, ...keys) {
    return Object.keys(object).sort((a, b) => {
        return keys.indexOf(a) - keys.indexOf(b);
    }).reduce((r, k) => (r[k] = object[k], r), {});
}

export const removeEmptyValues = function (object) {
    Object.keys(object).forEach((key) => {
        if (!object[key]) {
            object[key] = undefined;
        }
    })
}