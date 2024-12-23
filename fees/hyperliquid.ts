import { CHAIN } from "../helpers/chains"
import { Adapter, FetchOptions, } from '../adapters/types';
import { findClosest } from "../helpers/utils/findClosest";

const fetchFees = async (options: FetchOptions) => {
    const dailyFees = options.createBalances();
    const data:any[] = (await fetch(`https://api.hypurrscan.io/fees`).then(r => r.json())).map((t:any)=>({...t, time:t.time*1e3}))

    const startCumFees: any = findClosest(options.startTimestamp, data, 3600)
    const endCumFees: any = findClosest(options.endTimestamp, data, 3600)
    dailyFees.addCGToken("usd-coin", (endCumFees.total_fees - startCumFees.total_fees)/1e6)

    const totalFees = options.createBalances();
    totalFees.addCGToken("usd-coin", endCumFees.total_fees/1e6)

    return {
        dailyFees,
        dailyRevenue: dailyFees,
        totalFees,
        totalRevenue: totalFees,
    }
}

const adapter: Adapter = {
    version: 2,
    adapter: {
        [CHAIN.HYPERLIQUID]: {
            fetch: fetchFees,
            meta: {
                methodology: {
                    Fees: "Trade fees and ticket auction proceeds",
                }
            }
        },
    },
}
export default adapter