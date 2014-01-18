def some_data
[
  { id:'house-price',
     value:200000,
     min:50000,
     max:1000000,
     step:5000,
     name:"House Price($)"
  },
  { id:'equiv-rent',
       value:1500,
       min:200,
       max:5000,
       step:100,
       name:"Rent ($/mo)"
   },
   { id:'down-payment',
       value:20,
       min:0,
       max:100,
       step:5,
       name:"Down (%)"
   },
   { id:'rate-30yr',
       value:4.5,
       min:3,
       max:10,
       step:0.2,
       name:"APR (%)"
   },
   { id:'closing-costs-buy',
       value:3,
       min:0,
       max:6,
       step:0.2,
       name:"Closing costs/buy (%)"
   },
   { id:'closing-costs-sell',
       value:5,
       min:0,
       max:6,
       step:0.2,
       name:"Closing costs/sell (%)"
   },
   { id:'tax-rate',
       value:1.35,
       min:0,
       max:4,
       step:0.1,
       name:"Tax rate (%)"
   },
   { id:'maintenance-rate',
       value:1.5,
       min:0,
       max:3,
       step:0.1,
       name:"Other (%)"
   },
   { id:'investment-rate',
       value:7,
       min:0,
       max:20,
       step:0.2,
       name:"IRR (%)"
   },
   { id:'appreciation-rate',
       value:3,
       min:-10,
       max:10,
       step:0.2,
       name:"Appreciation (%/yr)"
   },
   { id:'number-years',
       value:30,
       min:5,
       max:30,
       step:1,
       name:"Term (years)"
   },
   { id:'disp-years',
       value:10,
       min:5,
       max:50,
       step:1,
       name:"Display (years)"
   }
]
end