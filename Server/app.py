from flask import Flask, request, jsonify
from forecast_module import forecast_savings
from forecast_module import forecast_savings, forecast_loan_payoff
from forecast_module import forecast_retirement_corpus

app = Flask(__name__)

@app.route("/forecast", methods=["POST"])
def get_forecast():
    data = request.json
    monthly_saving = float(data.get("monthlySaving", 0))
    forecast = forecast_savings(monthly_saving)
    return jsonify(forecast)

if __name__ == "__main__":
    app.run(debug=True)
    
@app.route("/loan-payoff", methods=["POST"])
def get_loan_forecast():
    data = request.json
    loan_amount = float(data.get("loanAmount", 0))
    emi = float(data.get("monthlyEMI", 0))
    interest = float(data.get("interestRate", 10)) / 100

    try:
        result = forecast_loan_payoff(loan_amount, emi, interest)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/retirement", methods=["POST"])
def get_retirement_forecast():
    data = request.json
    current_age = int(data.get("age", 30))
    savings = float(data.get("currentSavings", 0))
    monthly_contribution = float(data.get("monthlyContribution", 0))
    return_rate = float(data.get("annualReturn", 8)) / 100

    result = forecast_retirement_corpus(
        current_age=current_age,
        current_savings=savings,
        monthly_contribution=monthly_contribution,
        annual_return_rate=return_rate
    )
    return jsonify(result)