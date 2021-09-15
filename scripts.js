const Modal = {
  toggle() {
    document
      .querySelector(".modal-overlay")
      .classList
      .toggle("active");
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let incomes = 0;

    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        incomes += transaction.amount;
      }
    });

    return incomes;
  },

  expenses() {
    let expenses = 0;

    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });

    return expenses;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const amountFormated = Utils.formatCurrency(transaction.amount);

    const html = `
    <tr>
      <td class="description">${transaction.description}</td>
      <td class="${cssClass}">${amountFormated}</td>
      <td>${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" class="button remove" src="./assets/minus.svg" alt="Remover transação">
      </td>
    </tr>
    `;

    return html;
  },

  updateBalance() {
    document
      .getElementById("incomeOverlay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document  
      .getElementById("expenseOverlay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
      .getElementById("totalOverlay")
      .innerHTML = Utils.formatCurrency(Transaction.total());   
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils = {
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatAmount(value) {
    return Number(value) * 100;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g ,"");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  }
}

const Form = {

  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos do formulário");
    }
  },

  formatData() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {

      Form.validateFields();
      const transaction = Form.formatData();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.toggle();

    } catch (error) {
      alert(error.message);
    }

  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    })
    
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  }
}

App.init();