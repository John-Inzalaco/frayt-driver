type AnyObject = { [key: string]: any };

export function shallowEqual(
  objA?: Nullable<AnyObject>,
  objB?: Nullable<AnyObject>,
) {
  if (!objA || !objB) {
    return objA === objB;
  }
  return !Boolean(
    Object.keys(Object.assign({}, objA, objB)).find(
      (key) => objA[key] !== objB[key],
    ),
  );
}
