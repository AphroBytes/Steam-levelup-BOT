const messages = require('../../../../Config/messages');
const log = require('../../../../Components/log');
const inventory = require('../../../../Components/inventory');
const chatMessage = require('../../../../Components/message');
const { filterCommands } = require('../../../../Utils');
const utils = require('../../../../Utils');

module.exports = (sender, client, users) => {
  const language = utils.getLanguage(sender.getSteamID64(), users);

  log.userChat(sender.getSteamID64(), language, '[ !STOCK ]');
  chatMessage(client, sender, messages.REQUEST[language]);

  chatMessage(
    client,
    sender,
    filterCommands(messages.STOCK[language])
      .join('\n')
      .replace('{TOTALBOTSETS}', inventory.stock.totalBotSets)
      .replace('{CSKEYSTRADABLE}', inventory.stock.csKeys.tradable)
      .replace('{HYDRAKEYSTRADABLE}', inventory.stock.hydraKeys.tradable)
      .replace('{TFKEYSTRADABLE}', inventory.stock.tfKeys.tradable)
      .replace('{GEMSQUANTITYTRADABLE}', inventory.stock.gemsQuantity.tradable)
      .replace('{CSKEYSNOTRADABLE}', inventory.stock.csKeys.notradable)
      .replace('{HYDRAKEYSNOTRADABLE}', inventory.stock.hydraKeys.notradable)
      .replace('{TFKEYSNOTRADABLE}', inventory.stock.tfKeys.notradable)
      .replace(
        '{GEMSQUANTITYNOTRADABLE}',
        inventory.stock.gemsQuantity.notradable
      )
  );
};
