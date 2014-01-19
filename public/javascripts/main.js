// Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required
Array.prototype.last = function() {
  return this[this.length - 1];
};

var chart;

var allInputs = $(":input");

var params = {};
var sliderChangeFun = function(key){
  return function(event, ui) {
    $("#" + key).val(ui.value);
    params[key] = ui.value;
    updateChart();
  };
};

(function setUpSliders(){
  var key = '';
  for (var ix=0; ix<allInputs.length; ix++) {
    parent = allInputs[ix];
    key = parent.id;
    possible_slider = $("#" + key + "-slider");
    if (possible_slider !== undefined && possible_slider.length !== 0){
      possible_slider.slider({
        min: parseFloat(parent.attributes['data-min'].value),
        max: parseFloat(parent.attributes['data-max'].value),
        value: parseFloat(parent.value),
        step: parseFloat(parent.attributes['data-step'].value),
        slide: sliderChangeFun(key)
      });
    }
  }
})();

function loadParams(){
  var key = '';
  for (var ix = 0; ix < allInputs.length; ix++){
    key = allInputs[ix].id;
    params[key] = parseFloat(allInputs[ix].value);
  }
}

var getChartUpdateFun = function(key) {
  return function() {
    params[key] = $("#" + key).val();
    $("#" + key + "-slider").slider( "value", params[key]);
    updateChart();
  };
};

var updateChart = function(){

  d3.select('#chart1 svg')
    .datum(financeData())
    .call(chart);
  //chart.update();
};

nv.addGraph(function() {
  loadParams();
  chart = nv.models.lineChart()
  .options({
    margin: {left: 100, bottom: 100},
    x: function(d,i) { return i/12.0; },
    showXAxis: true,
    showYAxis: true,
    transitionDuration: 0
  })
  ;

  // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
  chart.xAxis
    .axisLabel("Time (years)")
    .tickFormat(d3.format(',.1f'));

  chart.yAxis
    .axisLabel('Amount ($)')
    .tickFormat(d3.format(',.2f'))
    ;

  d3.select('#chart1 svg')
    .datum(financeData())
    .call(chart);

  //TODO: Figure out a good way to do this automatically
  nv.utils.windowResize(chart.update);
  //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

  chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

  for (var key in params ) {
    $("#" + key).change ( getChartUpdateFun(key) );
  }
  return chart;
});

function loanPayment(initial_balance, term, rate) {
  var i = rate / 12.0 / 100.0;
  var p = initial_balance;
  var n = term * 12.0;
  var monthly_payment = (i * p * Math.pow(1 + i, n) ) / ( Math.pow(1 + i, n) - 1);

  return function(balance) {
    if (monthly_payment > balance) {
      return balance;
    } else {
      return monthly_payment;
    }
  };
}

var inds = {
  'loan_balance': 0,
  'owner_account': 1,
  'renter_account': 2,
  'owner_net': 3,
  'buy_minus_rent': 4
};

var chartData =  [
  {
    values: [],
    key: "Loan Balance",
    color: "#ff7f0e"
  },
  {
    values: [],
    key: "Owner Account",
    color: "#2ca02c"
  },
  {
    values: [],
    key: "Renter Account",
    color: "#2222ff"
  },
  {
    values: [],
    key: "Net Owner Position",
    color: "#667711"
  },
  {
    area: true,
    values: [],
    key: "Buy minus Rent",
    color: "red"
  }
];

var loan_balances = [];
var invest_owner_balances = [];
var invest_renter_balances = [];
var net_owner_balances = [];

var houseValue = function(initial_price, t) {
  return initial_price * Math.pow(1.0 + params['appreciation-rate']/100.0/12, t);
};

var getOwnerNetBalance = function(house_value, closing_costs, t){
  var hv = house_value;
  return invest_owner_balances[t] - loan_balances[t] + hv - hv*closing_costs;
};

function financeData() {
  var L = params['disp-years']*12;

  // Adjust length of arrays
  loan_balances.length = L;
  invest_owner_balances.length = L;
  invest_renter_balances.length = L;
  net_owner_balances.length = L;

  chartData[inds['loan_balance']].values.length = L;
  chartData[inds['owner_account']].values.length = L;
  chartData[inds['renter_account']].values.length = L;
  chartData[inds['owner_net']].values.length = L;
  chartData[inds['buy_minus_rent']].values.length = L;

  var hp = params['house-price'],
      dp = params['down-payment'];


  loan_balances[0] = hp * (1.0 - dp/100.0 );


  var closing_buy = params['closing-costs-buy'] / 100.0;
  var closing_sell = params['closing-costs-sell'] / 100.0;
  
  invest_owner_balances[0] = 0;

  invest_renter_balances[0] = hp * ( dp/100.0 ) + hp*closing_buy;

  net_owner_balances[0] = getOwnerNetBalance(hp, closing_sell, 0);
  
  var calcPayment = loanPayment(loan_balances[0], params['number-years'], params['rate-30yr']);

  $("#monthly-payment").text("Est Payment: " + Math.round(calcPayment(loan_balances[0])));

  var monthly_total = Math.round(calcPayment(loan_balances[0]) + hp * params['tax-rate']/100.0/12 + hp * params['maintenance-rate']/100.0/12);

  $("#monthly-payment-total").text("Est Payment (w/taxes and fees): " + monthly_total);

  var irr = params['investment-rate']/100.0/12;
  var ib = 0, io = 0, irent = 0;
  var hv;
  for (var t = 1; t < L; t++) {
    
    hv = houseValue(hp, t);

    loan_payment = calcPayment(loan_balances[t-1]);

    rent_payment = params['equiv-rent'] * Math.pow( 1 + params['appreciation-rate']/100.0/12, t);

    maintenance = hv * params['maintenance-rate']/100.0/12;

    taxes = houseValue(hp, t) * params['tax-rate']/100.0/12;
    diff = rent_payment - (loan_payment + maintenance + taxes);

    io = loan_balances[t-1];
    loan_balances[t] = io - loan_payment + io * params['rate-30yr']/100.0/12 ;

    ib = invest_owner_balances[t-1] * (1 + irr);
    invest_owner_balances[t] = diff + ib;

    irent = invest_renter_balances[t-1] * (1 + irr);
    invest_renter_balances[t] = irent;

    net_owner_balances[t] = getOwnerNetBalance(hv, closing_sell, t);
  }


  var tx;
  for (t = 0; t < L; t++){
    tx = t / 12.0;

    chartData[inds['loan_balance']].values[t] = {
      x: tx, y:loan_balances[t]
    };

    chartData[inds['owner_account']].values[t] = {
      x: tx, y:invest_owner_balances[t]
    };

    chartData[inds['renter_account']].values[t] = {
      x: tx, y:invest_renter_balances[t]
    };

    chartData[inds['owner_net']].values[t] = {
      x: tx, y:net_owner_balances[t]
    };

    chartData[inds['buy_minus_rent']].values[t] = {
      x: tx, y:net_owner_balances[t] - invest_renter_balances[t]
    };
  }

  return chartData;
}
