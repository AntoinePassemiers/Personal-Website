export function joinPaths(path1, path2) {
  if ((path1 === undefined) || (path1.length === 0)) return path2;
  if ((path2 === undefined) || (path2.length === 0)) return path1;
  var path = path1;
  if (path.at(-1) !== "/") path += "/";
  if (path2.at(0) === "/") path += path2.slice(1);
  else path += path2;
  return path;
}