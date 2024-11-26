/**
 *
 * @param {string} url
 */
module.exports = async (url) => {
  const data = await fetch(url);
  return await data.json();
};
