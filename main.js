const allowedTransactions = {
    "allowedTransactions": [{
            "merchantName": "DStv",
			"merchantCode": 763,
            "transactionAmountCents": 92900,
            "currencyCode": "zar",
            "dayOfMonth": 1
        }, {
            "merchantName": "Netflix",
			"merchantCode": 2345,
            "transactionAmountCents": 699,
            "currencyCode": "usd",
            "dayOfMonth": -1
        }
    ],
	"daysBefore": 0,
	"daysAfter": 4,
	"percentageLess": -10,
	"percentageMore": 20
}.allowedTransactions;

// DO NOT CHANGE THE CODE BELOW IF YOU DON'T KNOW WHAT YOU'RE DOING

async function notify(success, merchantName, currencyCode, centsAmount) {
    if (!success) {
        await fetch(process.env.notifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: `VCFortress blocked Investec transaction: an amount of ${currencyCode.toUpperCase()}  ${investec.helpers.format.decimal(centsAmount / 100, 100)} from merchant ${merchantName}.`
            }),
        });
    }
};

// This function runs during the card transaction authorization flow
// It has limited execution time, so keep any code short-running.

const beforeTransaction = async(authorization) => {
    const date = new Date() // today
    const today = date.getUTCDate() // 1 to 31
    const daysInThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();      // const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    // const allowedTransactions = process.env.allowedTransactions;		// env.json currently does not permit nested objects.  Workaround is to declare allowedTransactions at the start of main.js
    const settings = process.env;
    for (trans of allowedTransactions) {
        if (authorization.merchant.name.toLowerCase().includes(trans.merchantName.toLowerCase()) &&
            authorization.merchant.category.code == trans.merchantCode.toString() &&
            authorization.currencyCode.toLowerCase() == trans.currencyCode.toLowerCase()) {
				
            // Found a secured transaction, now to validate it
            if (authorization.centsAmount < trans.transactionAmountCents * (1 + settings.percentageLess / 100) ||
                authorization.centsAmount > trans.transactionAmountCents * (1 + settings.percentageMore / 100)) {
                notify(false, authorization.merchant.name, authorization.currencyCode, authorization.centsAmount);
                return false;
            }
            var dayOfMonth = trans.dayOfMonth
            // Adjust dayOfMonth for negative values (-1 = last day of the month, -2 = second last)
            if (dayOfMonth < 0) {
                dayOfMonth = daysInThisMonth + dayOfMonth + 1; // now 1 to 31
            }
            const lowerBound = (dayOfMonth - settings.daysBefore + daysInThisMonth) % daysInThisMonth // + daysInThisMonth to convert JavaScript remainder fn to modulo fn, so that the result is non-negative
            const upperBound = (dayOfMonth + settings.daysAfter) % daysInThisMonth

            // Normalise lowerBound and upperBound to 1-based index
            const normalisedLowerBound = lowerBound === 0 ? daysInThisMonth : lowerBound;
            const normalisedUpperBound = upperBound === 0 ? daysInThisMonth : upperBound;

            if (normalisedLowerBound <= normalisedUpperBound) {
                if (today < normalisedLowerBound ||
                    today > normalisedUpperBound) {
                    notify(false, authorization.merchant.name, authorization.currencyCode, authorization.centsAmount);
                    return false;
                }
                return true;
            } else {
                if (today < normalisedLowerBound &&
                    today > normalisedUpperBound) {
                    notify(false, authorization.merchant.name, authorization.currencyCode, authorization.centsAmount);
                    return false;
                }
                return true;
            }
        }
    }
    // Reject all other transactions
    notify(false, authorization.merchant.name, authorization.currencyCode, authorization.centsAmount);
    return false;
};

// This function runs after an approved transaction.
const afterTransaction = async(transaction) => {
    console.log(transaction);
};

// This function runs after a declined transaction
const afterDecline = async(transaction) => {
    console.log(transaction);
};