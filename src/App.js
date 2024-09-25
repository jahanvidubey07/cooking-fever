import { db, storage } from "./firebase.config";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    ingredients: [],
    steps: []
  });
  const [image, setImage] = useState(null);
  const [popupActive, setPopupActive] = useState(false);

  const recipesCollectionRef = collection(db, "recipes");

  useEffect(() => {
    onSnapshot(recipesCollectionRef, (snapshot) => {
      setRecipes(
        snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            viewing: false,
            ...doc.data(),
          };
        })
      );
    });
  }, []);

  const handleView = (id) => {
    const recipesClone = [...recipes];

    recipesClone.forEach((recipe) => {
      if (recipe.id === id) {
        recipe.viewing = !recipe.viewing;
      } else {
        recipe.viewing = false;
      }
    });

    setRecipes(recipesClone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.desc || !form.ingredients.length || !form.steps.length) {
      alert("Please fill out all fields.");
      return;
    }

    let imageUrl = "";
    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Save recipe to Firestore
    await addDoc(recipesCollectionRef, {
      ...form,
      imageUrl,
    });

    setForm({
      title: "",
      desc: "",
      ingredients: [],
      steps: [],
    });

    setImage(null);
    setPopupActive(false);
  };

  const handleIngredient = (e, i) => {
    const ingredientsClone = [...form.ingredients];
    ingredientsClone[i] = e.target.value;

    setForm({
      ...form,
      ingredients: ingredientsClone,
    });
  };

  const handleStep = (e, i) => {
    const stepsClone = [...form.steps];
    stepsClone[i] = e.target.value;

    setForm({
      ...form,
      steps: stepsClone,
    });
  };

  const handleIngredientCount = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, ""],
    });
  };

  const handleStepCount = () => {
    setForm({
      ...form,
      steps: [...form.steps, ""],
    });
  };

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const removeRecipe = (id) => {
    deleteDoc(doc(db, "recipes", id));
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li><button onClick={() => setPopupActive(true)}>Add Recipe</button></li>
          <li><button>Top Recipes</button></li>
          <li><button>Manage Recipes</button></li>
          <li><button>Tips</button></li>
          <li><button>Vegetarian</button></li>
          <li><button>Non-Veg</button></li>
        
        
          
        </ul>
      </div>

      {/* Main content */}
      <div className="main-content">
        <h1>My recipes</h1>

        <div className="recipes">
          {recipes.map((recipe) => (
            <div className="recipe" key={recipe.id}>
              <h3>{recipe.title}</h3>

              {recipe.imageUrl && (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  style={{ 
                    width: "400px", // Resized to 300px width
                    height: "400px", // Maintain aspect ratio
                    borderRadius: "10px", 
                    marginBottom: "1rem" 
                  }}
                />
              )}

              <p dangerouslySetInnerHTML={{ __html: recipe.desc }}></p>

              {recipe.viewing && (
                <div>
                  <h4>Ingredients</h4>
                  <ul>
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>

                  <h4>Steps</h4>
                  <ol>
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="buttons">
                <button onClick={() => handleView(recipe.id)}>
                  View {recipe.viewing ? "less" : "more"}
                </button>
                <button className="remove" onClick={() => removeRecipe(recipe.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-recipe-button-container">
          <button className="add-recipe" onClick={() => setPopupActive(!popupActive)}>
            Add Recipe
          </button>
        </div>

        {popupActive && (
          <div className="popup">
            <div className="popup-inner">
              <h2>Add a new recipe</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Recipe title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    type="text"
                    placeholder="Describe your recipe"
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ingredients</label>
                  {form.ingredients.map((ingredient, i) => (
                    <input
                      type="text"
                      key={i}
                      placeholder={`Ingredient ${i + 1}`}
                      value={ingredient}
                      onChange={(e) => handleIngredient(e, i)}
                    />
                  ))}
                  <button type="button" onClick={handleIngredientCount}>
                    Add ingredient
                  </button>
                </div>

                <div className="form-group">
                  <label>Steps</label>
                  {form.steps.map((step, i) => (
                    <textarea
                      key={i}
                      placeholder={`Step ${i + 1}`}
                      value={step}
                      onChange={(e) => handleStep(e, i)}
                    />
                  ))}
                  <button type="button" onClick={handleStepCount}>
                    Add step
                  </button>
                </div>

                <div className="form-group">
                  <label>Recipe Image</label>
                  <input type="file" onChange={handleImageUpload} />
                </div>

                <div className="buttons">
                  <button type="submit">Submit</button>
                  <button type="button" className="remove" onClick={() => setPopupActive(false)}>
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
