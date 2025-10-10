document.addEventListener('DOMContentLoaded', function () {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Download canvas as image on button click
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const canvas = document.getElementById('barChart')
    if (!canvas) return
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = 'monthly-income-vs-expense.png'
    link.click()
  })

  // Dynamically generate month input fields in the data tab
  const container = document.getElementById('month-inputs-container')
  const template = document.getElementById('month-input-template')
  if (container && template) {
    months.forEach(month => {
      const clone = template.content.cloneNode(true)
      clone.querySelector('.month-label').textContent = month

      // Income
      const incomeLabel = clone.querySelector('.income-label')
      incomeLabel.textContent = 'Income'
      incomeLabel.id = `${month.toLowerCase()}-income-label`
      const incomeInput = clone.querySelector('.income-input')
      incomeInput.id = `${month.toLowerCase()}-income`
      incomeInput.setAttribute('aria-describedby', incomeLabel.id)

      // Expense
      const expenseLabel = clone.querySelector('.expense-label')
      expenseLabel.textContent = 'Expense'
      expenseLabel.id = `${month.toLowerCase()}-expense-label`
      const expenseInput = clone.querySelector('.expense-input')
      expenseInput.id = `${month.toLowerCase()}-expense`
      expenseInput.setAttribute('aria-describedby', expenseLabel.id)

      // Set default values: income > expense, both between 100 and 500
      const expense = Math.floor(Math.random() * 401) + 100 // 100-500
      const income = Math.floor(Math.random() * (500 - (expense + 1) + 1)) + (expense + 1) // (expense+1)-500
      expenseInput.value = expense
      incomeInput.value = income

      container.appendChild(clone)
    })
  }

  // Helper to get values from inputs
  const getMonthlyData = type =>
    months.map(month => Number(document.getElementById(`${month.toLowerCase()}-${type}`)?.value) || 0)

  let barChartInstance = null

  // Show chart when Chart tab is activated
  document.getElementById('chart-tab')?.addEventListener('shown.bs.tab', () => {
    const incomeData = getMonthlyData('income')
    const expenseData = getMonthlyData('expense')
    const ctx = document.getElementById('barChart')?.getContext('2d')
    if (!ctx) return
    // Destroy previous chart if exists
    barChartInstance?.destroy()
    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
          },
          {
            label: 'Expense',
            data: expenseData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Monthly Income vs Expense' },
        },
      },
    })
  })

  // Function to handle username input changes
  document.getElementById('username')?.addEventListener('input', () => {
    const usernameInput = document.getElementById('username')
    const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    usernameInput.style.border = usernameRegex.test(usernameInput.value) ? '2px solid green' : '2px solid red'
  })
})
