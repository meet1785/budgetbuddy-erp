import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExpenseTest = () => {
  const handleSuccess = () => {
    console.log("Expense form submitted successfully!");
    alert("Expense submitted!");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Expense Form</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTest;