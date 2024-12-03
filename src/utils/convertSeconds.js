/**
 * @param {Number} seconds - Time in seconds
 * @return {String} - Return the formatted time
 */
module.exports = (seconds) => {
  const days = Math.floor(seconds / (24 * 3600))
  seconds %= 24 * 3600
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const parts = []

  if (days > 0) parts.push(`${days} days`);
  if (hours > 0) parts.push(`${hours} hours`);
  if (minutes > 0) parts.push(`${minutes} minutes`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds} seconds`);

  return parts.join(', ');
}