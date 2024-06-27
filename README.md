# investec-virtual-card-fortress

# Investec Programmable Banking challenge - Card Code Snippet Creation

This is my submission for [https://investec.gitbook.io/programmable-banking-community-wiki/get-building/build-events/q2-2024-bounty-challenge-or-card-code-snippets](https://investec.gitbook.io/programmable-banking-community-wiki/get-building/build-events/q2-2024-bounty-challenge-or-card-code-snippets)

### _Pushing the bounty boundaries_

_Please note that instead of simply providing static code snippet for a novice banking client to "copy 'n paste" into the Card IDE, the intention of this submission is to push the status quo much further; to analyse the client's bank transactions, automatically create one or more virtual cards and to customise the code for each of those cards.  This necessitates probably more changes than anticipated to the low-code screens and is thus possibly beyond the scope of the bounty challenge above.  However, I will still describe it in detail, as a possible future idea_.

## VCFortress 

Virtual Card Fortress is a low-code tool to shift recurring subscription payments to a separate virtual credit card and then to provide a configurable shield around those payments to reduce the possibility of fraudulent transactions.

VCFortress is offered as a low-code solution on Investec's Programmable Banking platform.  Check out their [amazing offering](https://www.investec.com/en_za/banking/tech-professionals/programmable-banking.html) and [API documentation](https://developer.investec.com/).

### Content

- [Opening the low-code screen](#heading--1)  
- [Solution](#heading--2)  
- [Future enhancement](#heading--3)  
- [Fallback proposal](#heading--4)  
- [Improvements](#heading--5)  

----

<a name="heading--1"/>

### Opening the low-code screen

1. Login to Investec Online and select Manage from the menu
1. Select Investec Developer
1. Scroll down to Low-code Quickstart and click View Code
1. Select any one of the existing snippets
1. Find your preferred card and toggle the Enabled button to On
1. Hover over the card and click <programmable.../> to open the Low-code screen

![Opening Low-code Quickstart](./images/code-snippets.png?raw=true)

![Selecting a Programmable Card](./images/card-selection.png?raw=true)

You should be on a page like https://login.secure.investec.com/wpaas/prog-banking-wpaas/no-code/code-review?option=SetLimitPerTransaction&cardKeyHash=123456

<a name="heading--2"/>

### Solution

It is clear that this low-code screen has access to my cards, as the open `env.json` file represents what is already loaded on the card, and is not simply a static file.  So it has access (and write access at that!) at least via the Programmable Card API [https://developer.investec.com/za/api-products/documentation/SA_Card_Code] to my account.

It is therefore not a large leap to assume that the low-code screen can be enhanced further to use the Private Banking API [https://developer.investec.com/za/api-products/documentation/SA_PB_Account_Information] to first analyse the account transactions and to identify those regular subscriptions that could be best protected by moving them to a new virtual credit card.  

The low-code screen would access the last 4-6 months of transactions, filtering those that have `transactionType` = 'CardPurchases' or 'DebitOrders', and capturing whether they have an existing `cardNumber` field.  Regular, consistent-value transactions are listed, along with whether they are debit orders or card purchases, the nominal transaction amount and date (day of the month), where -1 represents the last day of the month, -2 the second last, etc.

> ----
> #### Why use a virtual credit card?
> 
> Using a programmable virtual credit card can significantly reduce fraudulent transactions. It becomes much harder for fraudsters who obtain your credit card details to make unauthorized transactions if most transactions are automatically denied.  Cards can be easily deactivated without affecting your primary account. 
> 
> When it comes to subscription services, you now have enhanced control over them, allowing you to set individual spending limits and manage expiration dates. This makes it easy to prevent unwanted charges from services that are no longer needed or were unintentionally renewed. 
> 
> This level of control helps you manage your finances more effectively, avoid overspending, and reduces the hassle of disputing unauthorised charges with the bank.
> ----

Once the low-code screen has listed regular subscriptions, and the client selected one or more to be loaded to a new or existing virtual card, the low-code screen can then use the Programmable Card API to Create a Virtual Card (if necessary) and create customised card code (`main.js` and `env.json`), or alternatively, load the existing virtual card's `main.js` (this is currently not done, so existing code is often overwritten) and `env.json` for modification.

Sample `env.json` configuration file with two transactions:

```json
{
    "allowedTransactions": [{
            "merchantName": "DStv",
			"merchantCode": 1234,
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
}
```

The (card code)[link] will only allow these two selected transactions, rejecting everything else, within some specified flexibility e.g. 
* the transaction merchant/code cannot change
* the transaction amount can vary from -10% of nominal to +20%
* the transaction date can be within 4 days of nominal

Rejected transactions can (and probably should) be raised via the client's preferred notification channel, e.g. a (Telegram bot)[https://drive.google.com/file/d/1rnbHtGYngtWP2S3M5TAcCec_GIp30U6j/view].  

<a name="heading--3"/>

#### Future enhancement

Observed increases in monthly subscription fees can also be communicated via this same channel, and a further enhancement could be to accept a reply to this message (within a certain timeframe e.g. 12 hours) that permanently authorises the increase by programmatically altering the existing `env.json` and automatically publishing it to the appropriate card.  This bot unfortunately needs to be hosted somewhere else.

<a name="heading--4"/>

### Fallback proposal

Since the low-code screen is currently not able to analyse the client's transactions nor able to create a new virtual credit card, we need a workaround for these steps.  

* Creating a new virtual card can be done manually via the Investec app or website, and will automatically appear as a normal card in the low-code screen.

* Analysing the client's current transactions can be implemented with additional card code that first logs the transactions to an external database for 4-6 months and then selects repeat transactions from there, but in addition to an external database hardly being low-code, it has the major downside that the chances of a client coming back to complete the second step is obviously much reduced compared to completing the analysis in a single sitting.  Also, there is the small matter of banking security and confidentiality.

<a name="heading--5"/>

### Improvements

This solution is released as open source under the MIT license, to inspire the Investec Programable Banking Community and with the hopes that anyone can and will contribute improvements.


> :bulb: **Tip:** Join the [Programmable Banking Community](https://investec.gitbook.io/programmable-banking-community-wiki/home/readme) for more inspiration.