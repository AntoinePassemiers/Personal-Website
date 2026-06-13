const tagColors = [
  'tag-green',
  'tag-blue',
  'tag-purple',
  'tag-orange',
  'tag-pink',
  'tag-cyan'
];

const hashString = (value) => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  return Math.abs(hash);
};

export function getTagClass(tag) {
  const index = hashString(tag) % tagColors.length;
  return `tag ${tagColors[index]}`;
}
