import { CosmWasmClient } from "cosmwasm";
import { NolusClient, NolusContracts } from "@nolus/nolusjs";
const rpcEndpoint = "https://pirin-cl.nolus.network:26657/" ;//"https://rpc.cros-nest.com:443/nolus";
const lppContract = "nolus1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sqaa3c5"
export default defineEventHandler(async(event) => {
  NolusClient.setInstance(rpcEndpoint);
  const cosm = await NolusClient.getInstance().getCosmWasmClient();
  const client = await CosmWasmClient.connect(rpcEndpoint);
  const wasm_extention = client.getQueryClient().wasm

  const all_deposit = []
  let sum_deposit = 0

  const lpp_states = await wasm_extention.getAllContractState(lppContract, undefined);
  for (const lpper in lpp_states.models) {
    const lpper_id = Buffer.from(lpp_states.models[lpper].key).toString().slice(2);
    if (lpper_id.startsWith("depositsnolus1")) {
      const value = JSON.parse(Buffer.from(lpp_states.models[lpper].value).toString());
      sum_deposit += Number(value.deposited_nlpn.amount);
      all_deposit.push({
          key: lpper_id,
          deposit: Number(value.deposited_nlpn.amount),
          //rewards: Number(value.reward_per_token.amount.amount)
      })
    }
  }
  const lppInstance = new NolusContracts.Lpp(cosm, lppContract);
  const balance = await lppInstance.getLppBalance();
  return { 
    deposits: all_deposit,
    total: {
      balance: Number(balance.balance.amount),
      total_principal_due: Number(balance.total_principal_due.amount),
      total_interest_due: Number(balance.total_interest_due.amount),
      balance_nlpn: Number(balance.balance_nlpn.amount)
    }
  }
})