// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global state of app
** search object
** current recipe object
** shopping list object
** liked recipes
*/

const state = {};
/* testing purposes
*/
window.state = state;

/****************************************************/
/* Search Controller                                */
/****************************************************/
const controlSearch = async () =>
{
    // get query from view
    const query = searchView.getInput();

    if (query)
    {
        // new search object and add to state
        state.search = new Search(query);

        // prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try
        {
            // search for recipes
            await state.search.getResults();

            // render results on ui
            clearLoader();
            searchView.renderResults(state.search.result);
        }
        catch (error)
        {
            alert('something went wrong with the search');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e =>
{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e =>
{
    const btn = e.target.closest('.btn-inline');
    
    if (btn)
    {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/****************************************************/
/* Recipe Controller                                */
/****************************************************/
const controlRecipe = async () =>
{
    // get id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id)
    {
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected search item
        if (state.search)
        {
            searchView.highlightSelected(id);
        }

        // create new recipe object
        state.recipe = new Recipe(id);

        try
        {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        }
        catch (error)
        {
            alert('Error processing recipe');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
});

/****************************************************/
/* List Controller                                */
/****************************************************/
const controlList = () =>
{
    // create new list if there is none yet
    if (!state.list)
    {
        state.list = new List();
    }

    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el =>
    {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => 
{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *'))
    {
        state.list.deleteItem(id);

        // delete item from ui
        listView.deleteItem(id);
    }
    // handle the count update
    else if (e.target.matches('.shopping__count-value'))
    {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/* Testing purposes
window.l = new List(); 
*/