/**
 *
 * @param {import("discord.js").Interaction} interaction
 * @param {bigint} permission
 * @returns {boolean}
 */
module.exports = (interaction, permission) => {
  const member = interaction.member;

  if (!member || !member.permissions) {
    console.error("Membro inválido ou sem permissões disponíveis.");
    return false;
  }

  return member.permissions.has(permission);
};
