// Funktion zum Skalieren der Zutaten basierend auf den Portionen
export const scaleIngredients = (ingredients, basePortions, newPortions) => {
    return ingredients.map(ingredient => {
        if (!ingredient.amount || isNaN(ingredient.amount)) {
            // Wenn keine Menge vorhanden ist oder die Menge keine Zahl ist, wird sie unverändert zurückgegeben
            return ingredient;
        }
        const baseAmount = parseFloat(ingredient.amount);
        const scaledAmount = (baseAmount / basePortions) * newPortions;
        const roundedAmount = Math.round(scaledAmount * 100) / 100; // Runden auf zwei Dezimalstellen
        return {
            ...ingredient,
            amount: roundedAmount
        };
    });
};

// Funktion zur Formatierung der Anzeige von Mengen
export const formatAmount = (amount) => {
    if (amount === 'nach Bedarf') {
        return amount;
    }
    return Number.isInteger(amount) ? amount : amount.toFixed(2);
};

// Zusätzliche Hilfsfunktionen, die spezifisch für das Rezeptmanagement benötigt werden, können hier hinzugefügt werden.
