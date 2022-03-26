export const genRandomString = (length: number, chunk = ""): string => {
  const pattern = "abcdefghijklmnopqrstuvwxyz";
  return new Array(length)
    .fill(chunk)
    .map((i) => pattern[Math.floor(Math.random() * 20)] + i)
    .join("");
};
