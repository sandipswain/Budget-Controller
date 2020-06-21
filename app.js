//Budet Controller
var budgetController = (function () {
  //Some Code
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  /*var allExpenses=[];
var allIncomes=[];
var totalExpenses=0;*/
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum = sum + cur.value;
    });
    /**
     * 0
     * [200,400,100]
     * sum+=200
     * sum=+400
     */
    data.totals[type] = sum;
  };
  /**
   * Global datastructure
   */
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  //to make it available to others
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //[1 2 3 4 5],next ID=6
      //[1 2 4 6 8],next ID=9
      //ID=last ID+1

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //Incrementing the next ID here
      } else {
        ID = 0;
      }

      //Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //Push it into data structure
      data.allItems[type].push(newItem);
      //Return the new element
      return newItem;
    },
    deleteItem: function (type, id) {
      var ids, index;
      //id=3
      //data.allItems[type][id];
      //ids=[1 2  4  6 8]
      //if id=6
      //index=3
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1); //(where we want to delete ,how many)
      }
    },
    calculateBudget: function () {
      //calculate totl income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //calculate the budget:income-expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function () {
      /**
       * a=20
       * b=10
       * c=40
       * income=100
       * a=20/100=20%
       * b=10/100=10%
       * c=40/100=40%
       */
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    //Just to test the display of the datastructure
    testing: function () {
      console.log(data);
    },
  };
})();

/**Seperation of conserns */

//UI controller
var UIController = (function () {
  //Some code
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num, type) {
    /**
     * + or -before number
     * exactly 2 decimal points
     * , seperating thousands
     * 2310.4567->+2,310.46
     * 2000->2,000.00
     */
    var numSplit, int, dec, type, sign;
    num = Math.abs(num);
    num = num.toFixed(2); //Put two decimal numbers
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];
    type === "exp" ? (sign = "-") : (sign = "+");
    return sign + " " + int + "." + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      //1.Create Html string with placeholder
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //2.Replace the placeholder with te actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //3.Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      //here fields is a list so array methods i.e., fields.slice()can't be applied
      //converting to array object and calling fields
      fieldsArr = Array.prototype.slice.call(fields);
      fields.forEach(function (current, index, array) {
        //like a for loop
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    //To make it publically accessible
    getDOMstrings: function () {
      return DOMstrings;
    },
    displayBudget: function (obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + "%";
        else current.textContent = "---";
      });
    },
    displayMonth: function () {
      var now, year, month, months;
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      now = new Date();
      //var Chris=new Date(2016,11,25);
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
  };
})();

//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventlistener = function () {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      //console.log(event);
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var UpdateBudget = function () {
    //1.Calculate the budget
    budgetCtrl.calculateBudget();
    //2.Return the budget
    var budget = budgetCtrl.getBudget();
    //3.Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var UpdatePercentages = function () {
    //1.Calculate the %
    budgetCtrl.calculatePercentages();
    //2.Read % from the budgetcontroller
    var percentages = budgetCtrl.getPercentages();
    //3.Update the UI with the new percentages
    //console.log(percentages);
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    //1.Get the filed input data
    var input = UICtrl.getInput();
    //console.log(input);
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2.Add the items to the budget controller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      //3.Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      //4.Clear the input fields
      UICtrl.clearFields();
      //5.Calculate and upadte the budget
      UpdateBudget();
      //6.Calculate and update the %
      UpdatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //1.Delete the item from the datastructure
      budgetCtrl.deleteItem(type, ID);
      //2.Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      //3.Update and show the new budget
      UpdateBudget();

      //4.Calculate and update the %
      UpdatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventlistener();
    },
  };
})(budgetController, UIController);
controller.init();
//Analyse what done
//lec14-->
