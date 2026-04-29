const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get product data and check safety
router.get('/scan/:barcode', async (req, res) => {
  const { barcode } = req.params;
  const { allergies } = req.query; // Allergies passed as a comma-separated string from frontend

  try {
    // 1. Fetch product from Open Food Facts
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const response = await axios.get(offUrl);

    if (response.data.status === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = response.data.product;
    // Check multiple possible ingredient fields from OFF
    const ingredientsText = product.ingredients_text || 
                            product.ingredients_text_en || 
                            product.ingredients_text_with_allergens || 
                            'No ingredients list available for this product.';
    const allergensTags = product.allergens_tags || [];

    // 2. Handle User Allergies (from query params)
    const userAllergies = allergies ? allergies.split(',') : [];

    // 3. Safety Check Logic
    let unsafeIngredients = [];
    
    userAllergies.forEach(allergy => {
      if (!allergy) return;
      // Check in ingredients text (case insensitive)
      const regex = new RegExp(allergy, 'i');
      if (regex.test(ingredientsText)) {
        unsafeIngredients.push(allergy);
      }
      // Check in allergens tags (e.g., "en:milk")
      const tagMatch = allergensTags.some(tag => tag.toLowerCase().includes(allergy.toLowerCase()));
      if (tagMatch && !unsafeIngredients.includes(allergy)) {
        unsafeIngredients.push(allergy);
      }
    });

    const isSafe = unsafeIngredients.length === 0;

    res.json({
      product: {
        name: product.product_name,
        brand: product.brands,
        image: product.image_url,
        ingredients: ingredientsText,
        allergens: allergensTags
      },
      safety: {
        isSafe,
        unsafeIngredients,
        message: isSafe ? 'Safe for you!' : `Warning: Contains ${unsafeIngredients.join(', ')}`
      }
    });

  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ message: 'Error processing scan' });
  }
});

module.exports = router;


module.exports = router;
