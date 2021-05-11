/* eslint-disable no-restricted-syntax */
const main = require('../../../../Config/main');
const messages = require('../../../../Config/messages');
const rates = require('../../../../Config/rates');
const utils = require('../../../../Utils');
const acceptedCurrencies = require('../../../../Config/currencies');
const inventory = require('../../../../Components/inventory');
const chatMessage = require('../../../../Components/message');
const makeOffer = require('../../../../Components/offer');
const { getSets } = require('../../../../Components/sets');
const log = require('../../../../Components/log');

module.exports = (sender, msg, client, users, community, allCards, manager) => {
  const language = utils.getLanguage(sender.getSteamID64(), users);
  const n = parseInt(msg.toUpperCase().replace('!SELLCSGO ', ''), 10);
  const amountofsets = n * rates.csgo.buy;
  const maxKeys = parseInt(main.maxSell / rates.csgo.buy, 10);

  if (!Number.isNaN(n) && n > 0) {
    log.userChat(sender.getSteamID64(), language, `[ !SELLCSGO ${n} ]`);
    if (n <= maxKeys) {
      chatMessage(client, sender, messages.REQUEST[language]);
      const botKeys = [];
      const theirSets = [];
      manager.getInventoryContents(730, 2, true, (ERR1, INV) => {
        if (ERR1) {
          log.error(`An error occurred while getting bot inventory: ${ERR1}`);
          chatMessage(
            client,
            sender,
            messages.ERROR.LOADINVENTORY.US[language]
          );
        } else {
          for (let i = 0; i < INV.length; i += 1) {
            if (
              botKeys.length < n &&
              acceptedCurrencies.csgo.indexOf(INV[i].market_hash_name) >= 0
            ) {
              botKeys.push(INV[i]);
            }
          }
          if (botKeys.length !== n) {
            chatMessage(
              client,
              sender,
              messages.ERROR.OUTOFSTOCK.DEFAULT.CSGO.US[0][language]
            );
          } else {
            let amountofB = amountofsets;
            inventory.getInventory(
              sender.getSteamID64(),
              community,
              (ERR2, DATA) => {
                if (!ERR2) {
                  const s = DATA;
                  getSets(s, allCards, (ERR3, DDATA) => {
                    if (!ERR3) {
                      utils.sortSetsByAmountB(s, (DATA2) => {
                        const setsSent = {};
                        firsttLoop: for (let i = 0; i < DATA2.length; i += 1) {
                          if (DDATA[DATA2[i]]) {
                            for (
                              let j = 0;
                              j < DDATA[DATA2[i]].length;
                              j += 1
                            ) {
                              if (amountofB > 0) {
                                if (!setsSent[DATA2[i]]) {
                                  setsSent[DATA2[i]] = 0;
                                }
                                if (
                                  setsSent[DATA2[i]] +
                                    (inventory.botSets[DATA2[i]]
                                      ? inventory.botSets[DATA2[i]].length
                                      : 0) <
                                  main.maxStock
                                ) {
                                  theirSets.push(DDATA[DATA2[i]][j]);
                                  amountofB -= 1;
                                  setsSent[DATA2[i]] += 1;
                                } else {
                                  continue firsttLoop;
                                }
                              } else {
                                continue firsttLoop;
                              }
                            }
                          } else {
                            continue;
                          }
                        }
                      });
                      if (amountofB > 0) {
                        chatMessage(
                          client,
                          sender,
                          messages.ERROR.OUTOFSTOCK.DEFAULT.SETS.THEM[0][
                            language
                          ]
                        );
                      } else {
                        const message = messages.TRADE.SETMESSAGE[2].CSGO[
                          language
                        ]
                          .replace('{SETS}', amountofsets)
                          .replace('{CSGO}', n);
                        makeOffer(
                          client,
                          users,
                          manager,
                          sender.getSteamID64(),
                          botKeys,
                          [].concat(...theirSets),
                          '!SELLCSGO',
                          message,
                          amountofsets,
                          0,
                          n,
                          0
                        );
                      }
                    } else {
                      chatMessage(
                        client,
                        sender,
                        messages.ERROR.LOADINVENTORY.THEM[0][language]
                      );
                      log.error(
                        `An error occurred while getting user sets: ${ERR3}`
                      );
                    }
                  });
                } else if (ERR2.message.indexOf('profile is private') > -1) {
                  chatMessage(
                    client,
                    sender,
                    messages.ERROR.LOADINVENTORY.THEM[2][language]
                  );
                  log.error(
                    `An error occurred while getting user inventory: ${ERR2}`
                  );
                } else {
                  chatMessage(
                    client,
                    sender,
                    messages.ERROR.LOADINVENTORY.THEM[0][language]
                  );
                  log.error(
                    `An error occurred while getting user inventory: ${ERR2}`
                  );
                }
              }
            );
          }
        }
      });
    } else {
      chatMessage(
        client,
        sender,
        messages.ERROR.INPUT.AMOUNTOVER.CSGO[language].replace(
          '{KEYS}',
          maxKeys
        )
      );
    }
  } else {
    chatMessage(
      client,
      sender,
      messages.ERROR.INPUT.INVALID.CSGO[language].replace(
        '{command}',
        '!SELLCSGO 1'
      )
    );
  }
};
