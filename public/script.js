let standbyTimer = null;
let continueTimer = null;
let slideIndex = 0;
let isStandbyMode = true;
let canClickSlider = true;
let quickOrders = {};

function startStandbyMode() {
    
    const slideshow = document.getElementById('standby-slideshow');
    const continueDialog = document.getElementById('continue-order-dialog');
    const mainContainer = document.getElementById('main-container');
    const authSelection = document.getElementById('auth-selection');
    
    // Force hide continue dialog when entering standby mode
    continueDialog.classList.add('hidden');
    clearTimeout(continueTimer);
    
    // Hide all other screens
    mainContainer.classList.add('hidden');
    authSelection.classList.add('hidden');
    
    // Show slideshow
    slideshow.classList.remove('hidden');
    isStandbyMode = true;
    showSlides();

    // Reset all menu states
    const productView = document.getElementById("product-view");
    const menuGrid = document.getElementById("menu-grid");
    const backButton = document.getElementById("back-button");
    const customizationWindow = document.getElementById("customization-window");
    const cartWindow = document.getElementById("cart-window");
    
    // Hide product view and customization windows
    if (productView) productView.classList.add('hidden');
    if (customizationWindow) customizationWindow.classList.add('hidden');
    if (cartWindow) cartWindow.classList.add('hidden');
    
    // Show main menu grid
    if (menuGrid) menuGrid.classList.remove('hidden');
    
    // Hide back button
    if (backButton) {
        backButton.classList.add('hidden');
        backButton.style.display = 'none';
    }
}

function showSlides() {
    if (!canClickSlider) return; // Prevent new clicks if delay is active
    canClickSlider = false; // Disable further clicks

    const slides = document.getElementsByClassName('slide');
    
    // Hide all slides
    for (let slide of slides) {
        slide.classList.remove('active');
    }
    
    // Show next slide
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('active');
    
    // Continue slideshow if in standby mode
    if (isStandbyMode) {
        setTimeout(showSlides, 5000); // Change slide every 5 seconds
    }

    // Re-enable clicks after 2 seconds
    setTimeout(() => {
        canClickSlider = true;
    }, 2000);
}

function freezeWelcomeButtons() {
    const buttons = document.querySelectorAll('#auth-selection button, #selection-screen button');
    buttons.forEach(button => button.disabled = true);
    setTimeout(() => {
        buttons.forEach(button => button.disabled = false);
    }, 750);
}

function exitStandbyMode() {
    if (!isStandbyMode) return;
    
    const slideshow = document.getElementById('standby-slideshow');
    const continueDialog = document.getElementById('continue-order-dialog');
    const authSelection = document.getElementById('auth-selection');
    
    // Hide slideshow and continue dialog
    slideshow.classList.add('hidden');
    continueDialog.classList.add('hidden');
    
    // Show auth selection screen if coming back from timeout
    if (continueTimer !== null) {
        authSelection.classList.remove('hidden');
        clearTimeout(continueTimer);
        continueTimer = null;
    }
    
    isStandbyMode = false;
    
    // Freeze welcome buttons for 3 seconds
    freezeWelcomeButtons();
    
    // Start inactivity timer
    resetInactivityTimer();
}

function resetInactivityTimer() {
    clearTimeout(standbyTimer);
    clearTimeout(continueTimer);
    
    standbyTimer = setTimeout(() => {
        showContinueDialog();
    }, 180000); // 3 minutes
}

function showContinueDialog() {
    // Only show dialog if we're not in standby mode AND slideshow is hidden
    if (!isStandbyMode && document.getElementById('standby-slideshow').classList.contains('hidden')) {
        const dialog = document.getElementById('continue-order-dialog');
        dialog.classList.remove('hidden');
        
        let timeLeft = 15;
        const countdown = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            timeLeft--;
            countdown.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                resetToStandby();
            }
        }, 1000);
        
        continueTimer = setTimeout(() => {
            clearInterval(timer);
            resetToStandby();
        }, 15000);
    }
}

function continueOrder() {
    const dialog = document.getElementById('continue-order-dialog');
    dialog.classList.add('hidden');
    clearTimeout(continueTimer);
    clearTimeout(standbyTimer); // Clear the standby timer
    resetInactivityTimer(); // Reset the inactivity timer
}

function resetToStandby() {

    
    // Clear any existing timers
    clearTimeout(standbyTimer);
    clearTimeout(continueTimer);

    closeCustomization()
    closeReceipt()
    
    // Reset all states
    cart = [];
    totalCartCount = 0;
    orderType = '';
    
    // Hide all screens
    document.querySelectorAll('.hidden').forEach(el => el.classList.add('hidden'));
    
    // Show auth selection screen
    document.getElementById('auth-selection').classList.remove('hidden');
    // Start standby mode
    startStandbyMode();
    confirmCloseReceipt()

}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Hide continue dialog explicitly on page load
    document.getElementById('continue-order-dialog').classList.add('hidden');
    
    // Start in standby mode
    startStandbyMode();
    
    // Exit standby mode on touch/click
    document.addEventListener('click', exitStandbyMode);
    document.addEventListener('touchstart', exitStandbyMode);
    
    // Reset inactivity timer on any interaction
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
});

const menuData = {
    Kebabs: [
        { 
            name: "Doner", 
            price: { regular: 12.50, large: 15.00, jumbo: 18.00 }, 
            image: "images/doner.png" 
        },
        { 
            name: "Chicken", 
            price: { regular: 12.50, large: 15.00, jumbo: 18.00 }, 
            image: "images/chicken.png" 
        },
        { 
            name: "Mixed", 
            price: { regular: 12.50, large: 15.00, jumbo: 18.00 }, 
            image: "images/mixed.png" 
        },
        { 
            name: "Falafel", 
            price: { regular: 11.00, large: 13.00, jumbo: 15.00 }, 
            image: "images/falafel.png" 
        }
    ],
    Vegetarian: [
        { name: "Kebab Salad", price: { regular: 9.00, large: 11.00, jumbo: 13.00 }, image: "images/kebab_salad.png" },
        { name: "Salad Box", price: { regular: 8.00, large: 10.00, jumbo: 14.00 }, image: "images/salad_box.png" }
    ],
    Borek: [
        { name: "Spinach & Feta", price: 8.50, image: "images/spinach_feta_borek.png" },
        { name: "Chicken (Cheese & Mushroom)", price: 8.50, image: "images/chicken_borek.png" },
        { name: "Lamb (Cheese, Capsicum, Tomato, Onion)", price: 8.50, image: "images/lamb_borek.png" }
    ],
    "Shish Kebab": [
        { name: "Shish Kebab", price: 4.00, image: "images/shish_kebab.png" }
    ],
    "Mega Meal": [
        { 
            name: "Mix Meal", 
            price: { regular: 18.00, large: 20.00, jumbo: 23.00 }, 
            image: "images/mega_kebab_meal.png" 
        },
        { 
            name: "Lamb Meal", 
            price: { regular: 18.00, large: 20.00, jumbo: 23.00 }, 
            image: "images/mega_kebab_meal.png" 
        },
        { 
            name: "Chicken Meal", 
            price: { regular: 18.00, large: 20.00, jumbo: 23.00 }, 
            image: "images/mega_kebab_meal.png" 
        }
    ],
    Desserts: [
        { name: "Milk Shake", price: { regular: 5.00, large: 7.00 }, image: "images/milk_shake.png" },
        { name: "Slushie", price: { regular: 2.50, large: 3.50 }, image: "images/slushie.png" },
        { name: "Ice Cream", price: 3.00, image: "images/ice_cream.png" },
        { name: "Coffee", price: 2.50, image: "images/coffee.png" },
        { name: "Baghlava", price: 5.00, image: "images/baghlava.png" },
        { name: "Chocolate", price: 2.00, image: "images/chocolate.png" }
    ],
    "Snack Pack": [
        { name: "Mixed", price: { small: 15.00, regular: 19.00, large: 23.00, jumbo: 29.00 }, image: "images/snack_pack.png" },
        { name: "Chicken", price: { small: 15.00, regular: 19.00, large: 23.00, jumbo: 29.00 }, image: "images/chicken_snack_pack.png" },
        { name: "Lamb", price: { small: 15.00, regular: 19.00, large: 23.00, jumbo: 29.00 }, image: "images/lamb_snack_pack.png" }
    ],
    "Chips and Nuggets": [
        { name: "Chips", price: { regular: 3.50, medium: 5.50, large: 7.00, jumbo: 8.00 }, image: "images/chips.png" },
        { name: "Chips and Nuggets", price: { regular: 7.00, large: 8.00 }, image: "images/nuggets.png" }
     ],                                              
    Drinks: [
        { name: "Coke", price: 1.50,
            image: "images/coke.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
               
                tags: ["Classic", "Cola", "Original"]
            } },
        { name: "Water", price: 1.00, image: "images/water.png",             
            details: {
            volume: "425 mL",
            
           

            tags: ["Still", "Pure", "Hydration"]
        } },
        { 
            name: "V Energy Drink - Guarana",
            price: 4.50,
            image: "images/v_energy.png",
            details: {
                volume: "330 mL",
                type: "Energy Drink",
                ingredients: ["Natural Guarana Extract", "Caffeine", "B Vitamins"],
                nutritionInfo: {
                    caffeine: "85mg per 100mL",
                    sugar: "Low Sugar"
                },
                tags: ["Energy", "Guarana", "Carbonated"]
            }
        },
        { 
            name: "Bundaberg - Ginger Beer",
            price: 4.00,
            image: "images/bundaberg_ginger.png",
            details: {
                volume: "375 mL",
                type: "Craft Beverage",
                ingredients: ["Ginger Root", "Cane Sugar", "Water"],
                nutritionInfo: {
                    style: "Traditional Recipe",
                    sugar: "Natural Sugars"
                },
                tags: ["Craft", "Ginger", "Australian"]
            }
        },
        { 
            name: "Bundaberg - Burgundee Creaming Soda",
            price: 4.00,
            image: "images/bundaberg_creaming.png",
            details: {
                volume: "375 mL",
                type: "Craft Beverage",
                ingredients: ["Cane Sugar", "Natural Colors", "Vanilla Extract"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    flavor: "Vanilla Cream"
                },
                tags: ["Craft", "Creaming", "Australian"]
            }
        },
        { 
            name: "Bundaberg - Guava",
            price: 4.00,
            image: "images/bundaberg_guava.png",
            details: {
                volume: "375 mL",
                type: "Sparkling Fruit Drink",
                ingredients: ["Real Guava", "Sparkling Water", "Natural Flavors"],
                nutritionInfo: {
                    fruit: "Real Guava",
                    style: "Sparkling"
                },
                tags: ["Craft", "Fruit", "Australian"]
            }
        },
        {
            name: "Sprite - Natural Flavour",
            price: 3.50,
            image: "images/sprite.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Natural Lemon-Lime Flavor", "Sweeteners"],
                nutritionInfo: {
                    sugar: "Sugar Free",
                    calories: "Low Calorie"
                },
                tags: ["Refreshing", "Lemon-Lime", "Carbonated"]
            }
        },
        {
            name: "Red Bull Energy Drink",
            price: 4.50,
            image: "images/redbull.png",
            details: {
                volume: "250 mL",
                type: "Energy Drink",
                ingredients: ["Caffeine", "Taurine", "B-Vitamins", "Sugars"],
                nutritionInfo: {
                    caffeine: "80mg per can",
                    energy: "High Energy"
                },
                tags: ["Energy", "Caffeinated", "Premium"]
            }
        },
        {
            name: "Solo - Lemon Flavour- Zero Sugar",
            price: 3.50,
            image: "images/solo_zero.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Lemon Flavor", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Zero Sugar",
                    calories: "No Added Sugar"
                },
                tags: ["Sugar-Free", "Lemon", "Refreshing"]
            }
        },
        {
            name: "Fanta - Orange",
            price: 3.50,
            image: "images/fanta_orange.png",
            details: {
                volume: "390 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Orange Flavor", "Natural Colors"],
                nutritionInfo: {
                    flavor: "Natural Orange",
                    style: "Classic Recipe"
                },
                tags: ["Orange", "Fruity", "Classic"]
            }
        },
        {
            name: "Pepsi",
            price: 3.50,
            image: "images/pepsi.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cola Flavor", "Sugar"],
                nutritionInfo: {
                    style: "Classic Cola",
                    sugar: "Regular"
                },
                tags: ["Cola", "Classic", "Original"]
            }
        },
        {
            name: "Pepsi Max",
            price: 3.50,
            image: "images/pepsi_max.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cola Flavor", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Sugar Free",
                    caffeine: "Enhanced Caffeine"
                },
                tags: ["Sugar-Free", "Cola", "Maximum Taste"]
            }
        },
        {
            name: "Maximus - Grape",
            price: 5.50,
            image: "images/maximus_grape.png",
            details: {
                volume: "1 L",
                type: "Sports Drink",
                ingredients: ["Purified Water", "Grape Flavor", "Electrolytes"],
                nutritionInfo: {
                    electrolytes: "Enhanced Formula",
                    vitamins: "B Vitamins Added"
                },
                tags: ["Sports", "Grape", "Hydration"]
            }
        },
        {
            name: "Maximus - Red",
            price: 5.50,
            image: "images/maximus_red.png",
            details: {
                volume: "1 L",
                type: "Sports Drink",
                ingredients: ["Purified Water", "Berry Flavor", "Electrolytes"],
                nutritionInfo: {
                    electrolytes: "Enhanced Formula",
                    vitamins: "B Vitamins Added"
                },
                tags: ["Sports", "Berry", "Hydration"]
            }
        },
        {
            name: "Coke - Zero Sugar",
            price: 3.50,
            image: "images/coke_zero.png",
            details: {
                volume: "375 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cola Flavor", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Zero Sugar",
                    calories: "Zero Calories"
                },
                tags: ["Sugar-Free", "Cola", "Zero"]
            }
        },
        {
            name: "Mojo - Orange Juice",
            price: 4.50,
            image: "images/mojo_orange.png",
            details: {
                volume: "425 mL",
                type: "Fresh Juice",
                ingredients: ["Fresh Orange", "Vitamin C", "No Added Sugar"],
                nutritionInfo: {
                    style: "Cold Pressed",
                    vitamins: "Rich in Vitamin C"
                },
                tags: ["Fresh", "Natural", "No Preservatives"]
            }
        },
        {
            name: "Mojo - Apple Juice",
            price: 4.50,
            image: "images/mojo_apple.png",
            details: {
                volume: "425 mL",
                type: "Fresh Juice",
                ingredients: ["Fresh Apple", "Vitamin C", "No Added Sugar"],
                nutritionInfo: {
                    style: "Cold Pressed",
                    vitamins: "Natural Vitamins"
                },
                tags: ["Fresh", "Natural", "No Preservatives"]
            }
        },
        {
            name: "Fuze Tea - Lemon",
            price: 4.00,
            image: "images/fuze_lemon.png",
            details: {
                volume: "500 mL",
                type: "Iced Tea",
                ingredients: ["Black Tea", "Natural Lemon", "Green Tea Extract"],
                nutritionInfo: {
                    antioxidants: "With Antioxidants",
                    calories: "Low Calorie"
                },
                tags: ["Refreshing", "Tea", "Lemon"]
            }
        },
        {
            name: "Tea - ITO EN",
            price: 4.50,
            image: "images/ito_en.png",
            details: {
                volume: "535 mL",
                type: "Iced Tea",
                ingredients: ["Japanese Green Tea", "Pure Water"],
                nutritionInfo: {
                    style: "Authentic Japanese",
                    caffeine: "Natural Caffeine"
                },
                tags: ["Japanese", "Unsweetened", "Pure"]
            }
        },
        {
            name: "Lipton - Peach",
            price: 4.00,
            image: "images/lipton_peach.png",
            details: {
                volume: "500 mL",
                type: "Iced Tea",
                ingredients: ["Black Tea", "Natural Peach Flavor", "Tea Extract"],
                nutritionInfo: {
                    style: "Sweetened",
                    flavor: "Natural Peach"
                },
                tags: ["Peach", "Refreshing", "Tea"]
            }
        },
        {
            name: "Lipton - Lemon",
            price: 4.00,
            image: "images/lipton_lemon.png",
            details: {
                volume: "500 mL",
                type: "Iced Tea",
                ingredients: ["Black Tea", "Natural Lemon Flavor", "Tea Extract"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    flavor: "Natural Lemon"
                },
                tags: ["Lemon", "Refreshing", "Tea"]
            }
        },
        {
            name: "Sprite - Natural Flavour",
            price: 4.00,
            image: "images/sprite_600.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Natural Lemon-Lime", "Sweeteners"],
                nutritionInfo: {
                    style: "Clear Lemon-Lime",
                    sugar: "Regular"
                },
                tags: ["Lemon-Lime", "Refreshing", "Carbonated"]
            }
        },
        {
            name: "Kirks - Lemon Squash",
            price: 4.00,
            image: "images/kirks_lemon.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Natural Lemon", "Cane Sugar"],
                nutritionInfo: {
                    style: "Classic Australian",
                    flavor: "Traditional Lemon"
                },
                tags: ["Australian", "Lemon", "Classic"]
            }
        },
        {
            name: "Kirks - Portello",
            price: 4.00,
            image: "images/kirks_portello.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Berry Flavors", "Natural Colors"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    flavor: "Mixed Berry"
                },
                tags: ["Australian", "Berry", "Traditional"]
            }
        },
        {
            name: "Monster - Energy Drink - Zero Ultra",
            price: 4.50,
            image: "images/monster_zero.png",
            details: {
                volume: "500 mL",
                type: "Energy Drink",
                ingredients: ["Carbonated Water", "Taurine", "B-Vitamins", "L-Carnitine"],
                nutritionInfo: {
                    caffeine: "160mg per can",
                    calories: "Zero Calories",
                    sugar: "Sugar Free"
                },
                tags: ["Energy", "Sugar-Free", "Performance"]
            }
        },
        {
            name: "Mother - Energy Drink",
            price: 4.50,
            image: "images/mother_energy.png",
            details: {
                volume: "500 mL",
                type: "Energy Drink",
                ingredients: ["Carbonated Water", "Caffeine", "Taurine", "Guarana"],
                nutritionInfo: {
                    caffeine: "160mg per can",
                    energy: "High Energy"
                },
                tags: ["Energy", "Caffeinated", "Australian"]
            }
        },
        {
            name: "Powerade - Mountain Blast",
            price: 4.50,
            image: "images/powerade_mountain.png",
            details: {
                volume: "600 mL",
                type: "Sports Drink",
                ingredients: ["Purified Water", "Electrolytes", "B Vitamins"],
                nutritionInfo: {
                    electrolytes: "ION4 Advanced System",
                    vitamins: "B3, B6, B12"
                },
                tags: ["Sports", "Hydration", "Performance"]
            }
        },
        {
            name: "Powerade - Berry Ice",
            price: 4.50,
            image: "images/powerade_berry.png",
            details: {
                volume: "600 mL",
                type: "Sports Drink",
                ingredients: ["Purified Water", "Electrolytes", "B Vitamins", "Berry Flavor"],
                nutritionInfo: {
                    electrolytes: "ION4 Advanced System",
                    vitamins: "B3, B6, B12"
                },
                tags: ["Sports", "Hydration", "Performance"]
            }
        },
        {
            name: "Cascade - Limon, Lime & Bitters",
            price: 4.00,
            image: "images/cascade_llb.png",
            details: {
                volume: "330 mL",
                type: "Mixer",
                ingredients: ["Sparkling Water", "Natural Lime", "Bitters Extract"],
                nutritionInfo: {
                    style: "Traditional Recipe",
                    flavor: "Complex Citrus"
                },
                tags: ["Refreshing", "Citrus", "Premium"]
            }
        },
        {
            name: "Cascade - Ginger Beer",
            price: 4.00,
            image: "images/cascade_ginger.png",
            details: {
                volume: "330 mL",
                type: "Craft Beverage",
                ingredients: ["Sparkling Water", "Ginger Extract", "Natural Flavors"],
                nutritionInfo: {
                    style: "Traditional Recipe",
                    flavor: "Spicy Ginger"
                },
                tags: ["Craft", "Spicy", "Premium"]
            }
        },
        {
            name: "Coke Classic",
            price: 4.00,
            image: "images/coke_classic_600.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cane Sugar", "Natural Flavors", "Caramel Color"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    sugar: "Regular"
                },
                tags: ["Classic", "Cola", "Original"]
            }
        },
        {
            name: "Coke Zero Sugar",
            price: 4.00,
            image: "images/coke_zero_600.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Natural Flavors", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Zero Sugar",
                    calories: "Zero Calories"
                },
                tags: ["Sugar-Free", "Cola", "Zero"]
            }
        },
        {
            name: "Coke Vanilla",
            price: 4.00,
            image: "images/coke_vanilla_600.png",
            details: {
                volume: "600 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cane Sugar", "Natural Vanilla Flavor", "Caramel Color"],
                nutritionInfo: {
                    style: "Vanilla Flavored",
                    flavor: "Sweet Vanilla"
                },
                tags: ["Vanilla", "Cola", "Flavored"]
            }
        },
        {
            name: "Fanta - Orange",
            price: 3.50,
            image: "images/fanta_orange_390.png",
            details: {
                volume: "390 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Orange Flavor", "Natural Colors"],
                nutritionInfo: {
                    flavor: "Natural Orange",
                    style: "Classic Recipe"
                },
                tags: ["Orange", "Fruity", "Classic"]
            }
        },
        {
            name: "Coke Zero Sugar ",
            price: 3.50,
            image: "images/coke_zero_390.png",
            details: {
                volume: "390 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cola Flavor", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Zero Sugar",
                    calories: "Zero Calories"
                },
                tags: ["Sugar-Free", "Cola", "Zero"]
            }
        },
        {
            name: "Coke Classic ",
            price: 3.50,
            image: "images/coke_classic_390.png",
            details: {
                volume: "390 mL",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cane Sugar", "Natural Flavors", "Caramel Color"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    sugar: "Regular"
                },
                tags: ["Classic", "Cola", "Original"]
            }
        },
        {
            name: "Gatorade - Blue Bolt",
            price: 4.50,
            image: "images/gatorade_blue.png",
            details: {
                volume: "300 mL",
                type: "Sports Drink",
                ingredients: ["Purified Water", "Electrolytes", "Blue Raspberry Flavor"],
                nutritionInfo: {
                    electrolytes: "Advanced Formula",
                    vitamins: "B3, B6, B12"
                },
                tags: ["Sports", "Hydration", "Performance"]
            }
        },
        {
            name: "Fanta - Orange ",
            price: 5.50,
            image: "images/fanta_orange_1.25.png",
            details: {
                volume: "1.25 L",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Orange Flavor", "Natural Colors"],
                nutritionInfo: {
                    flavor: "Natural Orange",
                    style: "Family Size"
                },
                tags: ["Orange", "Fruity", "Share Size"]
            }
        },
        {
            name: "Fanta - Raspberry - Zero Sugar",
            price: 5.50,
            image: "images/fanta_raspberry_zero.png",
            details: {
                volume: "1.25 L",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Raspberry Flavor", "Artificial Sweeteners"],
                nutritionInfo: {
                    sugar: "Zero Sugar",
                    flavor: "Natural Raspberry"
                },
                tags: ["Sugar-Free", "Raspberry", "Share Size"]
            }
        },
        {
            name: "Coke Classic  ",
            price: 5.50,
            image: "images/coke_classic_1.25.png",
            details: {
                volume: "1.25 L",
                type: "Soft Drink",
                ingredients: ["Carbonated Water", "Cane Sugar", "Natural Flavors", "Caramel Color"],
                nutritionInfo: {
                    style: "Classic Recipe",
                    sugar: "Regular"
                },
                tags: ["Classic", "Cola", "Share Size"]
            }
        }
    ]
};
let cart = [];
let totalCartCount = 0;
let orderType = '';
let orderNumber = parseInt(localStorage.getItem('currentOrderNumber')) || 101; // Initialize the order number
let editingItemIndex = null;

// Update getNextOrderNumber function to be more robust
function getNextOrderNumber(increment = true) {
    try {
        // Get current number from localStorage
        let nextNumber = parseInt(window.localStorage.getItem('currentOrderNumber'));
        
        // If not a valid number or not set, initialize to 101
        if (isNaN(nextNumber) || nextNumber < 101) {
            nextNumber = 101;
        }

        if (increment) {
            // Store next number only if increment is true
            window.localStorage.setItem('currentOrderNumber', (nextNumber + 1).toString());
        }
        
        // Log for debugging
        console.log('Current order number:', nextNumber);
        
        return nextNumber;
    } catch (error) {
        console.error('Error managing order numbers:', error);
        // Fallback to 101 if there's any error
        window.localStorage.setItem('currentOrderNumber', '101');
        return 101;
    }
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize order number if not exists
    if (!window.localStorage.getItem('currentOrderNumber')) {
        window.localStorage.setItem('currentOrderNumber', '101');
    }
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userType = localStorage.getItem('userType');
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (isAuthenticated && userType === 'member' && action === 'showOrderType') {
        // User is logged in and redirected from auth page
        showOrderTypeSelection();
        
        // Update user profile
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.firstName) {
            document.getElementById('user-name').textContent = user.firstName;
            document.getElementById('user-points').textContent = user.points || 0;
            document.getElementById('user-profile').classList.remove('hidden');
        }
    } else if (userType === 'guest' && action === 'showOrderType') {
        // Guest user redirected from auth page
        showOrderTypeSelection();
    } else {
        // Show initial auth selection
        showAuthSelection();
    }
});

function showAuthSelection() {
    // Hide all other screens
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('main-container').classList.add('hidden');
    
    // Show auth selection
    document.getElementById('auth-selection').classList.remove('hidden');
    
    // Clear any previous selections
    cart = [];
    totalCartCount = 0;
    orderType = '';
    updateCart();
}

function continueAsGuest() {
    localStorage.setItem('userType', 'guest');
    const slideshow = document.getElementById('standby-slideshow');
    const authSelection = document.getElementById('auth-selection');
    const selectionScreen = document.getElementById('selection-screen');
    const mainContainer = document.getElementById('main-container');
    
    // Hide slideshow and auth selection
    slideshow.classList.add('hidden');
    authSelection.classList.add('hidden');
    
    // Show order type selection screen
    selectionScreen.classList.remove('hidden');
    selectionScreen.style.display = 'flex'; // Ensure display is set to flex
    mainContainer.classList.add('hidden');
}

function showOrderTypeSelection() {
    // Update user type display
    const userType = localStorage.getItem('userType');
    const userName = JSON.parse(localStorage.getItem('user') || '{}').firstName;
    const userTypeDisplay = document.getElementById('user-type-display');
    
    if (userType === 'member' && userName) {
        userTypeDisplay.innerHTML = `<p>Welcome back, ${userName}!</p>`;
    } else {
        userTypeDisplay.innerHTML = '<p>Continuing as Guest</p>';
    }

    // Hide auth selection and show order type selection
    document.getElementById('auth-selection').classList.add('hidden');
    document.getElementById('selection-screen').classList.remove('hidden');
}

function selectOption(type) {
    orderType = type;
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('main-container').classList.remove('hidden');
    document.getElementById('order-type').innerText = `Order Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('order-type').classList.remove('hidden');
    
    // Hide back button when showing main menu
    document.getElementById('back-button').classList.add('hidden');
    
    // Show user profile if member
    if (localStorage.getItem('userType') === 'member') {
        document.getElementById('user-profile')?.classList.remove('hidden');
    }
}

function goBack() {
    const productView = document.getElementById("product-view");
    const menuGrid = document.getElementById("menu-grid");
    const backButton = document.getElementById("back-button");
    const drinkFilters = document.querySelector('.drink-filters');
    
    // Remove drink filters if they exist
    if (drinkFilters) {
        drinkFilters.remove();
    }
    
    // Hide product view
    productView.classList.add('hidden');
    
    // Show main menu grid
    menuGrid.classList.remove('hidden');
    
    // Hide back button when returning to main menu
    backButton.classList.add('hidden');
    backButton.style.display = 'none';

    // Scroll to top of main menu
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function showProducts(category) {
    const productView = document.getElementById("product-view");
    const productGrid = document.getElementById("product-grid");
    const categoryTitle = document.getElementById("category-title");
    const backButton = document.getElementById("back-button");
    const menuGrid = document.getElementById("menu-grid");
    
    // Remove existing filters if they exist
    const existingFilters = document.querySelector('.drink-filters');
    if (existingFilters) {
        existingFilters.remove();
    }
    
    // Debug log
    console.log('Showing products for category:', category);
    
    // Clear existing products
    productGrid.innerHTML = '';
    categoryTitle.innerText = category;

    // Show back button only when viewing products, not on main menu
    backButton.classList.remove('hidden');
    backButton.style.display = 'block';

    // Show back button and product view, hide menu grid
    backButton.classList.remove('hidden');
    backButton.style.display = 'block';
    productView.classList.remove('hidden');
    menuGrid.classList.add('hidden');

    // Check if category exists in menuData
    if (!menuData[category]) {
        console.error('Category not found:', category);
        return;
    }

    // Add loading state for drinks category
    if (category === 'Drinks') {
        // Create filter system
        const filterSystem = document.createElement('div');
        filterSystem.className = 'drink-filters';
        
        // Add search bar
        const searchHTML = `
            <div class="drink-search">
                <input type="text" placeholder="Search drinks..." id="drink-search">
            </div>
        `;

        // Create filter sections
        const filterSections = `
            <div class="filter-section">
                <h3>Type</h3>
                <div class="filter-tags" data-filter-type="type">
                    <button class="filter-tag" data-type="Soft Drink"><i class="fas fa-glass-whiskey"></i>Soft Drinks</button>
                    <button class="filter-tag" data-type="Energy Drink"><i class="fas fa-bolt"></i>Energy Drinks</button>
                    <button class="filter-tag" data-type="Sports Drink"><i class="fas fa-running"></i>Sports Drinks</button>
                    <button class="filter-tag" data-type="Fresh Juice"><i class="fas fa-apple-alt"></i>Juices</button>
                    <button class="filter-tag" data-type="Iced Tea"><i class="fas fa-leaf"></i>Iced Tea</button>
                </div>
            </div>
            <div class="filter-section">
                <h3>Features</h3>
                <div class="filter-tags" data-filter-type="tags">
                    <button class="filter-tag" data-tag="Sugar-Free"><i class="fas fa-check-circle"></i>Sugar Free</button>
                    
                    <button class="filter-tag" data-tag="Natural"><i class="fas fa-seedling"></i>Natural</button>
                    <button class="filter-tag" data-tag="Classic"><i class="fas fa-star"></i>Classic</button>
                </div>
            </div>
            <div class="filter-section">
                <h3>Size</h3>
                <div class="filter-tags" data-filter-type="volume">
                    <button class="filter-tag" data-volume="375">375mL</button>
                    <button class="filter-tag" data-volume="600">600mL</button>
                    <button class="filter-tag" data-volume="1.25">1.25L</button>
                </div>
            </div>
            <button class="filter-clear" id="clear-filters">Clear All Filters</button>
        `;

        filterSystem.innerHTML = searchHTML + filterSections;
        productGrid.parentElement.insertBefore(filterSystem, productGrid);

        // Add filter functionality
        const searchInput = document.getElementById('drink-search');
        const filterTags = document.querySelectorAll('.filter-tag');
        const clearFilters = document.getElementById('clear-filters');
        
        let activeFilters = {
            search: '',
            type: new Set(),
            tags: new Set(),
            volume: new Set()
        };

        function updateDrinkDisplay() {
            const drinks = menuData[category];
            const filteredDrinks = drinks.filter(drink => {
                if (!drink.details) return false;

                // Search filter
                const matchesSearch = drink.name.toLowerCase().includes(activeFilters.search.toLowerCase());

                // Type filter
                const matchesType = activeFilters.type.size === 0 || 
                    Array.from(activeFilters.type).some(type => 
                        drink.details.type && drink.details.type.toLowerCase() === type.toLowerCase());

                // Tags filter - check if any of the active tags match drink tags
                const matchesTags = activeFilters.tags.size === 0 ||
                    Array.from(activeFilters.tags).some(tag =>
                        drink.details.tags.some(t => 
                            t.toLowerCase().includes(tag.toLowerCase()) || 
                            tag.toLowerCase().includes(t.toLowerCase())
                        )
                    );

                // Volume filter
                const matchesVolume = activeFilters.volume.size === 0 ||
                    Array.from(activeFilters.volume).some(vol => {
                        const drinkVol = drink.details.volume.toLowerCase();
                        if (vol === "1.25") {
                            return drinkVol.includes("1.25") || drinkVol.includes("1250");
                        }
                        return drinkVol.includes(vol);
                    });

                return matchesSearch && matchesType && matchesTags && matchesVolume;
            });

            // Get available types, features, and volumes from filtered drinks
            const availableTypes = new Set(filteredDrinks.map(drink => drink.details.type));
            const availableTags = new Set(filteredDrinks.flatMap(drink => drink.details.tags));
            const availableVolumes = new Set(filteredDrinks.map(drink => {
                const vol = drink.details.volume.toLowerCase();
                if (vol.includes('1.25') || vol.includes('1250')) return '1.25';
                if (vol.includes('375')) return '375';
                if (vol.includes('600')) return '600';
                return vol;
            }));

            // Update filter tag visibility
            document.querySelectorAll('.filter-tags[data-filter-type="type"] .filter-tag').forEach(tag => {
                const type = tag.dataset.type;
                if (activeFilters.search) {
                    tag.style.display = availableTypes.has(type) ? 'flex' : 'none';
                } else {
                    tag.style.display = 'flex';
                }
            });

            document.querySelectorAll('.filter-tags[data-filter-type="tags"] .filter-tag').forEach(tag => {
                const tagValue = tag.dataset.tag;
                if (activeFilters.search) {
                    tag.style.display = availableTags.has(tagValue) ? 'flex' : 'none';
                } else {
                    tag.style.display = 'flex';
                }
            });

            document.querySelectorAll('.filter-tags[data-filter-type="volume"] .filter-tag').forEach(tag => {
                const volume = tag.dataset.volume;
                if (activeFilters.search) {
                    tag.style.display = availableVolumes.has(volume) ? 'flex' : 'none';
                } else {
                    tag.style.display = 'flex';
                }
            });

            // Clear and repopulate product grid
            productGrid.innerHTML = '';

            if (filteredDrinks.length === 0) {
                productGrid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i> No drinks match your filters</div>';
                return;
            }

            // Display filtered drinks
            filteredDrinks.forEach(item => {
                const productDiv = document.createElement('div');
                productDiv.className = 'menu-item';
                
                const detailsHTML = `
                    <div class="drink-preview">
                        <span class="volume-badge-small">${item.details.volume}</span>
                        <span class="type-badge-small">${item.details.type}</span>
                        <div class="preview-tags">
                            ${item.details.tags.slice(0, 2).map(tag => 
                                `<span class="preview-tag">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;

                productDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="menu-item-text">${item.name}</div>
                    ${detailsHTML}
                    <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                `;

                productDiv.ondblclick = () => showCustomization(item.name, item.image, item.price, category);
                productGrid.appendChild(productDiv);
            });

            // Update active filter visual feedback
            filterTags.forEach(tag => {
                if (tag.style.display !== 'none') {  // Only update visible tags
                    const filterType = tag.closest('.filter-tags').dataset.filterType;
                    const value = tag.dataset[filterType === 'tags' ? 'tag' : filterType];
                    tag.classList.toggle('active', activeFilters[filterType].has(value));
                }
            });
        }

        // Event listeners
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value;
            updateDrinkDisplay();
        });

        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const filterType = tag.closest('.filter-tags').dataset.filterType;
                const value = tag.dataset[filterType === 'tags' ? 'tag' : filterType];
                
                if (activeFilters[filterType].has(value)) {
                    activeFilters[filterType].delete(value);
                } else {
                    activeFilters[filterType].add(value);
                }
                
                updateDrinkDisplay();
            });
        });

        clearFilters.addEventListener('click', () => {
            searchInput.value = '';
            activeFilters = {
                search: '',
                type: new Set(),
                tags: new Set(),
                volume: new Set()
            };
            filterTags.forEach(tag => tag.classList.remove('active'));
            updateDrinkDisplay();
        });

        // Initial display
        updateDrinkDisplay();
        
        // Add event listeners for keyboard
        searchInput.addEventListener('click', (e) => {
            e.preventDefault();
            const keyboard = document.getElementById('virtual-keyboard');
            if (keyboard) {
                keyboard.style.display = 'block';
                activeInput = searchInput; // Set active input for keyboard
            }
        });

        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value;
            updateDrinkDisplay();
        });

        // Add blur event to hide keyboard when focus is lost
        searchInput.addEventListener('blur', (e) => {
            // Small delay to allow for keyboard clicks to register
            setTimeout(() => {
                if (document.activeElement !== searchInput) {
                    const keyboard = document.getElementById('virtual-keyboard');
                    
                }
            }, 200);
        });

        // Update keyboard input handler
        function handleKey(key) {
            if (!activeInput) return;
            
            if (key === 'Space') {
                activeInput.value += ' ';
            } else if (key === 'Backspace') {
                activeInput.value = activeInput.value.slice(0, -1);
            } else {
                activeInput.value += key;
            }
            
            // Trigger input event to update search
            activeInput.dispatchEvent(new Event('input'));
        }
    } else {
        // Regular category loading
        menuData[category].forEach(item => {
            const productDiv = document.createElement('div');
            productDiv.className = 'menu-item';
            productDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-text">${item.name}</div>
                <div class="menu-item-price">$${typeof item.price === 'object' ? item.price.regular : item.price.toFixed(2)}</div>
            `;
            productDiv.ondblclick = () => showCustomization(item.name, item.image, item.price, category);
            productGrid.appendChild(productDiv);
        });
    }
}

function getMilkshakeBaseName(title) {
    return title.split('(')[0].trim();
}

function showCustomization(title, image, price, category, selectedSize = 'regular', selectedSauces = [], selectedExtras = [], quantity = 1, selectedSalads = []) {
    console.log('Opening customization for:', title, category); // Add debug logging
    
    const customizationWindow = document.getElementById("customization-window");
    const orderSection = document.querySelector('.order-section');
    const customProductTitle = document.getElementById("custom-product-title");
    const customProductImage = document.getElementById("custom-product-image");
    const totalPriceElement = document.getElementById("total-price");
    const customizationContent = document.querySelector('.customization-content');
    
    // Remove any existing drink details
    const existingDrinkDetails = document.querySelector('.drink-customization-details');
    if (existingDrinkDetails) {
        existingDrinkDetails.remove();
    }
    
    // Show the customization window
    customizationWindow.classList.remove('hidden');
    
    // Reset customization content data attributes
    customizationContent.removeAttribute('data-item-type');
    
    // In the showCustomization function, update the drink type detection:
    if (category === 'Drinks') {
        // Extract the base drink type from the title
        let drinkType = 'drink'; // default type
        if (title.toLowerCase().includes('coke')) {
            const drink = menuData.Drinks.find(d => d.name === title);
            // Check price first for the basic Coke
            if (drink.price === 1.50) {
                drinkType = 'coke150';
            }
            // Then check volume from drink details if it exists
            else if (drink?.details?.volume) {
                if (drink.details.volume === '600 mL') {
                    drinkType = 'coke600';
                } else if (drink.details.volume === '375 mL') {
                    drinkType = 'coke375';
                } else if (drink.details.volume === '390 mL') {
                    drinkType = 'coke390';
                } else if (drink.details.volume === '1.25 L') {
                    drinkType = 'coke1250';
                } else {
                    drinkType = 'coke';
                }
            }
        } else if (title.toLowerCase().includes('gatorade')) {
            drinkType = 'gatorade';
        } else if (title.toLowerCase().includes('pepsi')) {
            drinkType = 'pepsi';
        } else if (title.toLowerCase().includes('sprite')) {
            drinkType = 'sprite';
        } else if (title.toLowerCase().includes('fanta')) {
            drinkType = 'fanta';
        } else if (title.toLowerCase().includes('energy')) {
            drinkType = 'energy';
        } else if (title.toLowerCase().includes('water')) {
            drinkType = 'water';
        } else if (title.toLowerCase().includes('bundaberg')) {
            drinkType = 'bundaberg';
        } else if (title.toLowerCase().includes('solo')) {
            drinkType = 'solo';
        } else if (title.toLowerCase().includes('mojo')) {
            drinkType = 'mojo';
        } else if (title.toLowerCase().includes('tea')) {
            drinkType = 'tea';
        } else if (title.toLowerCase().includes('lipton')) {
            drinkType = 'lipton';
        } else if (title.toLowerCase().includes('kirks')) {
            drinkType = 'kirks';
        } else if (title.toLowerCase().includes('fuze')) {
            drinkType = 'fuze';
        } else if (title.toLowerCase().includes('maximus')) { // Add this condition
            drinkType = 'maximus';
        } else if (title.toLowerCase().includes('powerade')) {
            drinkType = 'powerade';
        } else if (title.toLowerCase().includes('cascade')) {
            drinkType = 'cascade';
        }
        customizationContent.setAttribute('data-item-type', drinkType);
    }
    // Handle other item types
    else if (title.includes('Milk Shake')) {
        customizationContent.setAttribute('data-item-type', 'milkshake');
        
    } 
    else if (title.includes('Baghlava')) {
        customizationContent.setAttribute('data-item-type', 'baghlava');
        
    } 
    else if (title.includes('Spinach & Feta')) {
        customizationContent.setAttribute('data-item-type', 'Spinach & Feta');
        
    } 

    else if (title.includes('Chicken (Cheese & Mushroom)')) {
        customizationContent.setAttribute('data-item-type', 'Chicken (Cheese & Mushroom)');
        
    } 

    else if (title.includes('Lamb (Cheese, Capsicum, Tomato, Onion)')) {
        customizationContent.setAttribute('data-item-type', 'Lamb (Cheese, Capsicum, Tomato, Onion)');
        
    } 
    
    else if (title.includes('Slushie')) {
        customizationContent.setAttribute('data-item-type', 'slushie');
    } else if (title.includes('Ice Cream')) {
        customizationContent.setAttribute('data-item-type', 'icecream');
    } else if (title.includes('Coffee')) {
        customizationContent.setAttribute('data-item-type', 'coffee');
    } else if (title.includes('Chocolate')) {
        customizationContent.setAttribute('data-item-type', 'chocolate');
    } else if (title.includes('Shish Kebab') || category === 'Shish Kebab') {
        customizationContent.setAttribute('data-item-type', 'shish');
    }

    customProductTitle.innerText = title.replace("Snack Pack", "").trim();
    customProductImage.src = image;

    let basePrice = typeof price === 'object' ? price[selectedSize] : price;
    let additionalCost = 0;

    if (selectedSauces.length > 2) {
        additionalCost += (selectedSauces.length - 2) * 0.50;
    }
    additionalCost += selectedExtras.length * 1.00; // Each extra costs $1.00

    const initialTotalPrice = basePrice + additionalCost;
    totalPriceElement.innerText = `$${initialTotalPrice.toFixed(2)}`;

    const quantityInput = document.getElementById("quantity");
    const sizeSelect = document.getElementById("size");
    
    // Handle size options based on category and item type
    if (category === 'Drinks') {
        // Drinks only have regular size
        sizeSelect.innerHTML = `<option value="regular">Regular</option>`;
        sizeSelect.value = 'regular';
        sizeSelect.disabled = true;
    } else if (category === 'Shish Kebab' || category === 'Borek') {
        // Shish Kebab and Borek items only have regular size
        sizeSelect.innerHTML = `<option value="regular">Regular</option>`;
        sizeSelect.value = 'regular';
        sizeSelect.disabled = true;
    } else if (title.includes('Ice Cream') || title.includes('Slushie') || title.includes('Baghlava') || title.includes('Chocolate') || title.includes('Coffee')) {
        // Ice cream, slushie and coffee only have regular size
        sizeSelect.innerHTML = `<option value="regular">Regular</option>`;
        sizeSelect.value = 'regular';
        sizeSelect.disabled = true;
    } else if (category === 'Kebabs' || title.includes('Kebab Salad') || title.includes('Mixed') || title.includes('Falafel') || title.includes('Salad Box')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
            <option value="jumbo">Jumbo</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (category === 'Snack Pack') {
        sizeSelect.innerHTML = `
            <option value="small">Small</option>
            <option value="regular">Regular</option>
            <option value="large">Large</option>
            <option value="jumbo">Jumbo</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (title.includes('Kebab Meal') || title.includes('Mega Meal')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
            <option value="jumbo">Jumbo</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (title.includes('Milk Shake') || title.includes('Slushie')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (title.includes('Chips') && !title.includes('Nuggets')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="jumbo">Jumbo</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (title.includes('Chips and Nuggets')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else if (title.includes('Ice Cream') || title.includes('Coffee')) {
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    } else {
        // Default size options for any other items
        sizeSelect.innerHTML = `
            <option value="regular">Regular</option>
            <option value="large">Large</option>
        `;
        sizeSelect.value = selectedSize;
        sizeSelect.disabled = false;
    }

    // Show/hide sauce section based on category
    const sauceSection = document.querySelector('.customization-content div:has(input[name="sauce"])');
    const hideSauceCategories = ['Desserts', 'Drinks'];
    
    if (hideSauceCategories.includes(category)) {
        sauceSection.style.display = 'none';
    } else {
        sauceSection.style.display = 'block';
    }

    // Show/hide salad section based on category
    const saladSection = document.querySelector('.customization-content div:has(input[name="salad"])');
    const hideSaladCategories = ['Borek', 'Shish Kebab', 'Desserts', 'Chips and Nuggets', 'Drinks'];
    
    if (hideSaladCategories.includes(category)) {
        saladSection.style.display = 'none';
    } else {
        saladSection.style.display = 'block';
    }

    // Show/hide extras section based on category
    const extrasSection = document.querySelector('.customization-content div:has(input[name="extra"])');
    const hideExtrasCategories = ['Shish Kebab', 'Desserts', 'Drinks'];
    
    if (hideExtrasCategories.includes(category)) {
        extrasSection.style.display = 'none';
    } else {
        extrasSection.style.display = 'block';
    }

    // Show/hide milkshake flavors section
    const flavorSection = document.getElementById('milkshake-flavors');
    if (flavorSection) {
        if (title.includes('Milk Shake')) {
            flavorSection.style.display = 'block';
            // If editing an existing milkshake, get its flavor
            if (editingItemIndex !== null && cart[editingItemIndex].title.includes('(')) {
                const flavorMatch = cart[editingItemIndex].title.match(/\((.*?)\)/);
                if (flavorMatch) {
                    const flavor = flavorMatch[1];
                    const flavorInput = document.querySelector(`input[name="flavor"][value="${flavor}"]`);
                    if (flavorInput) {
                        flavorInput.checked = true;
                        flavorInput.closest('.option-box').classList.add('selected-flavor');
                    }
                }
            } else {
                // Select default flavor for new milkshakes
                const defaultFlavor = document.querySelector('input[name="flavor"]');
                if (defaultFlavor) {
                    defaultFlavor.checked = true;
                    defaultFlavor.closest('.option-box').classList.add('selected-flavor');
                }
            }
        } else {
            flavorSection.style.display = 'none';
        }
    }

    const sauceCheckboxes = document.querySelectorAll('input[name="sauce"]');
    const extraCheckboxes = document.querySelectorAll('input[name="extra"]');
    const saladCheckboxes = document.querySelectorAll('input[name="salad"]');

    // Reset customization fields
    quantityInput.value = quantity;
    
    // Only set sauce checkboxes if category allows sauces
    if (!hideSauceCategories.includes(category)) {
        sauceCheckboxes.forEach(checkbox => checkbox.checked = selectedSauces.includes(checkbox.value));
    } else {
        sauceCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    // Only set extras checkboxes if category allows extras
    if (!hideExtrasCategories.includes(category)) {
        extraCheckboxes.forEach(checkbox => checkbox.checked = selectedExtras.includes(checkbox.value));
    } else {
        extraCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    // Only set salad checkboxes if category allows salads
    if (!hideSaladCategories.includes(category)) {
        saladCheckboxes.forEach(checkbox => checkbox.checked = selectedSalads.includes(checkbox.value));
    } else {
        saladCheckboxes.forEach(checkbox => checkbox.checked = false);
    }

    // Function to update total price
    function updateTotalPrice() {
        let updatedPrice = typeof price === 'object' ? price[sizeSelect.value] : price;

        const selectedSauces = Array.from(sauceCheckboxes).filter(cb => cb.checked);
        const selectedExtras = Array.from(extraCheckboxes).filter(cb => cb.checked);
        const selectedSalads = Array.from(saladCheckboxes).filter(cb => cb.checked);

        // Calculate additional costs for sauces and extras
        let additionalCost = 0;
        if (selectedSauces.length > 2) {
            additionalCost += (selectedSauces.length - 2) * 0.50;
        }

        // Calculate extras cost
        selectedExtras.forEach(extra => {
            if (extra.value === 'Carrot') {
                additionalCost += 0.70;
            } else {
                additionalCost += 1.00; // Standard $1.00 for all other extras
            }
        });

        updatedPrice += additionalCost;
        totalPriceElement.innerText = `$${updatedPrice.toFixed(2)}`;
    }

    // Add event listeners to update price when options change
    sizeSelect.addEventListener('change', updateTotalPrice);
    sauceCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateTotalPrice));
    extraCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateTotalPrice));
    saladCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateTotalPrice));

    customizationWindow.classList.remove('hidden');
    orderSection.style.display = 'block'; // Show the order section when customization window is closed
    
    // Set category attribute for styling
    customizationContent.setAttribute('data-category', category);

    if (category === 'Drinks') {
        const drink = menuData.Drinks.find(d => d.name === title);
        if (drink?.details) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'drink-customization-details';
            detailsSection.innerHTML = createDrinkLabels(drink.details);
            
            // Insert after the title
            customProductTitle.insertAdjacentElement('afterend', detailsSection);
            
            // Hide unnecessary sections for drinks
            const sectionsToHide = ['milkshake-flavors', 'options-section'];
            sectionsToHide.forEach(section => {
                const element = document.querySelector(`#${section}`);
                if (element) element.style.display = 'none';
            });
        }
    }
    // Reorder sections by moving Salads to the top
    const saladsSection = customizationContent.querySelector('#salads');
    const saucesSection = customizationContent.querySelector('#sauces');
    
    if (saladsSection && saucesSection) {
        customizationContent.insertBefore(saladsSection, saucesSection);
    }
}

function resetCustomizations() {
    // Reset checkboxes
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset option boxes
    const allOptionBoxes = document.querySelectorAll('.option-box');
    allOptionBoxes.forEach(box => {
        box.classList.remove('selected');
        if (box.hasAttribute('data-sauce-type')) {
            box.classList.add('free');
            const priceElement = box.querySelector('.option-price');
            if (priceElement) {
                priceElement.textContent = 'Free';
            }
        }
    });

    // Reset quantity
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
        quantityInput.value = 1;
    }

    // Reset size to default
    const sizeSelect = document.getElementById("size");
    if (sizeSelect) {
        sizeSelect.value = 'regular';
    }

    // Reset total price
    const totalPriceElement = document.getElementById("total-price");
    if (totalPriceElement) {
        totalPriceElement.innerText = '$0.00';
    }

    // Reset milkshake flavor selection
    const flavorRadios = document.querySelectorAll('input[name="flavor"]');
    flavorRadios.forEach(radio => radio.checked = false);
    if (flavorRadios.length > 0) flavorRadios[0].checked = true;

    // Reset flavor selection styling
    const flavorBoxes = document.querySelectorAll('#milkshake-flavors .option-box');
    flavorBoxes.forEach(box => box.classList.remove('selected-flavor'));
}



function closeCustomization() {
    const customizationWindow = document.getElementById('customization-window');
    customizationWindow.classList.add('closing');
    setTimeout(() => {
        customizationWindow.classList.add('hidden');
        customizationWindow.classList.remove('closing');
    }, 400); // Match the duration of the closing animation
    const orderSection = document.querySelector('.order-section');
    orderSection.style.display = 'block'; // Show the order section when customization window is closed
    
    // Reset button text back to default
    document.getElementById('orderActionButton').textContent = 'Add to Your Order';
    
    editingItemIndex = null; // Reset the editing index
    resetCustomizations(); // Reset all selections
}

function addToOrder() {
    const quantity = parseInt(document.getElementById("quantity").value);
    const size = document.getElementById("size").value;
    let title = document.getElementById("custom-product-title").innerText;
    const image = document.getElementById("custom-product-image").src; // Get the image source
    let price = parseFloat(document.getElementById("total-price").innerText.replace('$', ''));
    const category = document.getElementById("category-title").innerText;
    
    // Only get sauces if category allows them
    const hideSauceCategories = ['Desserts', 'Drinks'];
    const sauces = hideSauceCategories.includes(category) ? [] : 
        Array.from(document.querySelectorAll('input[name="sauce"]:checked')).map(el => el.value);
    
    // Only get extras if category allows them
    const hideExtrasCategories = ['Shish Kebab', 'Desserts', 'Drinks'];
    const extras = hideExtrasCategories.includes(category) ? [] : 
        Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(el => el.value);
    
    // Only get salads if category allows them
    const hideSaladCategories = ['Borek', 'Shish Kebab', 'Desserts', 'Chips and Nuggets', 'Drinks'];
    const salads = hideSaladCategories.includes(category) ? [] : 
        Array.from(document.querySelectorAll('input[name="salad"]:checked')).map(el => el.value);

    // Only allow salad options for specific categories
    const allowSaladCategories = ['Kebabs', 'Snack Pack', 'Vegetarian', 'Mega Meal'];
    const finalSalads = allowSaladCategories.includes(category) ? salads : [];

    // Get drink details if it's a drink
    let drinkVolume = '';
    if (category === 'Drinks') {
        const drink = menuData.Drinks.find(d => d.name === title);
        if (drink?.details) {
            drinkVolume = drink.details.volume;
        }
    }

    if (quantity > 0) {
        let selectedFlavor = '';
        if (title.includes('Milk Shake')) {
            const flavorRadio = document.querySelector('input[name="flavor"]:checked');
            if (!flavorRadio) {
                alert("Please select a flavor for your Milk Shake");
                return;
            }
            selectedFlavor = flavorRadio.value;

            // If editing an existing milkshake, remove the old flavor
            if (editingItemIndex !== null) {
                title = title.split('(')[0].trim(); // Remove old flavor
            }
            
            // Add new flavor
            title = `${title} (${selectedFlavor})`;
        }

        const item = {
            title,
            category,
            size,
            drinkVolume, // Add drink volume to item
            quantity,
            sauces,
            extras,
            salads: finalSalads,
            price: (price * quantity).toFixed(2), // Ensure price is multiplied by quantity
            image // Include the image in the item
        };

        if (editingItemIndex !== null) {
            const oldItem = cart[editingItemIndex];
            cart[editingItemIndex] = item; // Update the existing item
            
            // Move updated item to end of cart so it shows as "last item"
            cart.splice(editingItemIndex, 1);
            cart.push(item);
            
            editingItemIndex = null; // Reset the editing index
        } else {
            cart.push(item); // Add new item to the cart
        }

        totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);
        updateCart();
        closeCustomization(); // This will now also reset the selections
    } else {
        alert("Please select a valid quantity.");
    }
}

function updateCart() {
    const cartCountElement = document.getElementById("cart-count");
    const orderDetailsElement = document.getElementById("order-details");
    const cartOrderTypeElement = document.getElementById("cart-order-type");
    const cartTotalPriceElement = document.getElementById("cart-total-price");
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
    
    cartCountElement.innerText = totalCartCount;

    if (totalCartCount > 0) {
        // Show last item selection for 5 seconds
        const lastItem = cart[cart.length - 1];
        const sauces = lastItem.sauces.length > 0 ? `Sauces: ${lastItem.sauces.join(', ')}` : '';
        const extras = lastItem.extras.length > 0 ? `Extras: ${lastItem.extras.join(', ')}` : '';
        
        // Calculate subtotal and final total
        const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
        const finalTotal = Math.max(0, subtotal - appliedDiscount);
        
        // Check if this was an update or new item
        const message = editingItemIndex !== null ? 
            `Updated: ${lastItem.quantity} x ${lastItem.category} - ${lastItem.title} (${lastItem.category === 'Drinks' ? lastItem.drinkVolume : lastItem.size}) - $${lastItem.price} ${sauces} ${extras}` :
            `Just Selected: ${lastItem.quantity} x ${lastItem.category} - ${lastItem.title} (${lastItem.category === 'Drinks' ? lastItem.drinkVolume : lastItem.size}) - $${lastItem.price} ${sauces} ${extras}`;
        
        // Show the message
        orderDetailsElement.innerText = message;
        
        // Set a timeout to clear the message after 5 seconds
        setTimeout(() => {
            if (cart.length > 0) {
                orderDetailsElement.innerText = `Your cart has ${totalCartCount} item${totalCartCount > 1 ? 's' : ''}`;
            } else {
                orderDetailsElement.innerText = 'Your cart is empty.';
            }
        }, 5000);

        cartOrderTypeElement.innerText = `Order Type: ${orderType.charAt(0).toUpperCase() + orderType.slice(1)}`;
        
        // Update price display to show discount if applied
        if (appliedDiscount > 0) {
            cartTotalPriceElement.innerHTML = `
                <div><s>Original Total: $${subtotal.toFixed(2)}</s></div>
                <div class="discount-row">Points Discount: -$${appliedDiscount.toFixed(2)}</div>
                <strong>Final Total: <span class="total-price-amount">$${finalTotal.toFixed(2)}</span></strong>
            `;
        } else {
            cartTotalPriceElement.innerHTML = `<strong>Total:</strong> <span class="total-price-amount">$${subtotal.toFixed(2)}</span>`;
        }
    } else {
        orderDetailsElement.innerText = 'Your cart is empty.';
        cartOrderTypeElement.innerText = '';
        cartTotalPriceElement.innerHTML = '';
        closeCart();
    }
    
    // Update points redemption UI if available
    const pointsRedemption = document.getElementById('points-redemption');
    if (pointsRedemption && !pointsRedemption.classList.contains('hidden')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        updatePointsDisplay(user.points || 0);
    }
}

function openCart() {
    closeCustomization();
    const cartWindow = document.getElementById("cart-window");
    cartWindow.classList.remove('hidden');
    const cartContainer = cartWindow.querySelector('.cart-container');
    
    // Get applied discount from localStorage
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
    const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
    const finalTotal = Math.max(0, subtotal - appliedDiscount);

    cartContainer.innerHTML = `
        <div class="cart-header">
            <h2>Your Order</h2>
            <p id="cart-order-type"></p>
            <div id="points-redemption" class="points-redemption hidden">
                <div class="points-info">
                    <p>Available Points: <span id="available-points">0</span></p>
                    <p>Redeemable Amount: $<span id="redeemable-amount">0.00</span></p>
                </div>
                <button id="redeem-points-btn" onclick="redeemPoints()" ${appliedDiscount > 0 ? 'disabled style="display: none;"' : ''}>
                    Redeem Points
                </button>
            </div>
        </div>
        <ul id="cart-list"></ul>
        <div class="cart-footer"></div>
    `;

    const cartList = document.getElementById("cart-list");
    const cartFooter = cartContainer.querySelector('.cart-footer');

    if (cart.length === 0) {
        cartList.innerHTML = '<li>Your cart is empty. Please add items to your order.</li>';
        cartFooter.innerHTML = `
            <button onclick="closeCart()">Close Cart</button>
        `;
        document.getElementById('points-redemption').classList.add('hidden');
    } else {
        // Populate cart items
        cart.forEach((item, index) => {
            const sauceFees = item.sauces.length > 2 ? (item.sauces.length - 2) * 0.50 : 0;
            const extraFees = item.extras.reduce((total, extra) => {
                if (extra === 'Carrot') return total + 0.70;
                return total + 1.00;
            }, 0);
            const saladFees = item.salads.reduce((total, salad) => {
                if (salad === 'Tabbouli') return total + 1.00;
                if (salad === 'Carrot') return total + 0.70;
                return total;
            }, 0);
            const totalFees = sauceFees + extraFees + saladFees;

            const listItem = document.createElement('li');
            listItem.className = 'cart-item';
            listItem.innerHTML = `
                <div class="cart-item-content">
                    <div class="cart-item-main">
                        <span class="cart-item-text">${item.quantity} x ${item.category} - ${item.title} (${item.category === 'Drinks' ? item.drinkVolume : item.size})</span>
                        <span class="cart-item-price">$${item.price}</span>
                    </div>
                    <div class="cart-item-details">
                        ${item.sauces.length > 0 ? `
                            <div class="cart-item-sauces">
                                Sauces: ${item.sauces.join(', ')}
                                <span class="cart-item-fee">+$${sauceFees.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        ${item.extras.length > 0 ? `
                            <div class="cart-item-extras">
                                Extras: ${item.extras.join(', ')}
                                <span class="cart-item-fee">+$${extraFees.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        ${item.salads.length > 0 ? `
                            <div class="cart-item-salads">
                                Salads: ${item.salads.join(', ')}
                                <span class="cart-item-fee">+$${saladFees.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="edit-btn" onclick="editCartItem(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="removeCartItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartList.appendChild(listItem);
        });

        // Add total and checkout buttons to footer
        const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
        const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
        const finalTotal = Math.max(0, subtotal - appliedDiscount);
        
        // Update cart footer with discount information if applicable
        if (appliedDiscount > 0) {
            cartFooter.innerHTML = `
                <div class="cart-summary">
                    <div class="cart-subtotal">Original Total: $${subtotal.toFixed(2)}</div>
                    <div class="cart-discount">Points Discount: -$${appliedDiscount.toFixed(2)}</div>
                    <div class="cart-final-total">Final Total: $${finalTotal.toFixed(2)}</div>
                </div>
                <button class="cart-checkout-btn" onclick="proceedToCheckout()">
                    Proceed to Checkout ($${finalTotal.toFixed(2)})
                </button>
                <button onclick="closeCart()">Close Cart</button>
            `;
        } else {
            cartFooter.innerHTML = `
                <div class="cart-total-price">
                    <strong>Total:</strong> <span class="total-price-amount">$${subtotal.toFixed(2)}</span>
                </div>
                <button class="cart-checkout-btn" onclick="proceedToCheckout()">
                    Proceed to Checkout
                </button>
                <button onclick="closeCart()">Close Cart</button>
            `;
        }

        // Update points redemption display
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && typeof user.points !== 'undefined' && user.points >= 50) {
            document.getElementById('points-redemption').classList.remove('hidden');
            updatePointsDisplay(user.points);
        }
    }
}

function updatePointsDisplay(points = 0) {
    const availablePoints = document.getElementById('available-points');
    const redeemableAmount = document.getElementById('redeemable-amount');
    const redeemButton = document.getElementById('redeem-points-btn');
    
    // Ensure points is a number and not NaN
    points = parseInt(points) || 0;
    // Changed conversion rate: 50 points = $2
    const redeemableValue = Math.floor(points / 50) * 2;
    
    // Update display with fallback to 0
    availablePoints.textContent = points.toString();
    redeemableAmount.textContent = redeemableValue.toFixed(2);
    
    // Disable redeem button if insufficient points (changed to 50)
    redeemButton.disabled = points < 50;
}

function getCategoryFromTitle(title) {
    // Helper function to determine the correct category for items
    if (title.includes('Milk Shake') || title.includes('Slushie') || 
        title.includes('Ice Cream') || title.includes('Coffee')) {
        return 'Desserts';
    }
    // Add other special cases if needed
    return null;
}

function editCartItem(index) {
    closeCart();
    const item = cart[index];
    
    // Always use the original category from the cart item
    const category = item.category;
    
    // Find the menu item using the original category
    const baseName = item.title.split('(')[0].trim();
    const menuItem = menuData[category].find(menuItem => menuItem.name === baseName);
    
    if (!menuItem) {
        console.error('Menu item not found:', baseName, category);
        return;
    }

    // Set editing mode
    editingItemIndex = index;
    
    // Update button text to show we're editing
    document.getElementById('orderActionButton').textContent = 'Update Your Order';
    
    // Set category title to match the original category
    document.getElementById("category-title").innerText = category;

    // Call showCustomization with the original category
    showCustomization(
        item.title,
        item.image,
        menuItem.price,
        category,
        item.size,
        item.sauces,
        item.extras,
        item.quantity,
        item.salads
    );
    
    // After showCustomization sets up the window, restore the selections
    setTimeout(() => {
        restoreSelections(item);
        updateSauceLabels();
        
        // Special handling for milkshake flavors
        if (item.title.includes('Milk Shake')) {
            const flavorMatch = item.title.match(/\((.*?)\)/);
            if (flavorMatch) {
                const flavor = flavorMatch[1];
                const flavorInput = document.querySelector(`input[name="flavor"][value="${flavor}"]`);
                if (flavorInput) {
                    flavorInput.checked = true;
                    document.querySelectorAll('#milkshake-flavors .option-box').forEach(box => {
                        box.classList.remove('selected-flavor');
                    });
                    flavorInput.closest('.option-box').classList.add('selected-flavor');
                }
            }
        }
    }, 0);
}

function restoreSelections(item) {
    // Restore sauces
    item.sauces.forEach(sauce => {
        const sauceBox = document.querySelector(`.option-box[data-sauce-type] input[value="${sauce}"]`);
        if (sauceBox) {
            sauceBox.checked = true;
            sauceBox.closest('.option-box').classList.add('selected');
        }
    });

    // Restore extras
    item.extras.forEach(extra => {
        const extraBox = document.querySelector(`input[name="extra"][value="${extra}"]`);
        if (extraBox) {
            extraBox.checked = true;
            extraBox.closest('.option-box').classList.add('selected');
        }
    });

    // Restore salads
    item.salads.forEach(salad => {
        const saladBox = document.querySelector(`input[name="salad"][value="${salad}"]`);
        if (saladBox) {
            saladBox.checked = true;
            saladBox.closest('.option-box').classList.add('selected');
        }
    });

    // Restore size and quantity
    const sizeSelect = document.getElementById('size');
    const quantityInput = document.getElementById('quantity');
    if (sizeSelect) sizeSelect.value = item.size;
    if (quantityInput) quantityInput.value = item.quantity;

    // Restore flavor selection if it exists
    if (item.title.includes('Milk Shake') && item.title.includes('(')) {
        const flavor = item.title.match(/\((.*?)\)/)[1];
        const flavorBox = document.querySelector(`#milkshake-flavors input[value="${flavor}"]`);
        if (flavorBox) {
            flavorBox.checked = true;
            flavorBox.closest('.option-box').classList.add('selected-flavor');
        }
    }
}

function removeCartItem(index) {
    // Remove the item from the cart
    closeCart();
    
    cart.splice(index, 1);
    
    // Update the total cart count
    totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);
    openCart()
    // Update the cart display
    updateCart();
   
    // Close the cart window
   
}

function closeCart() {
    document.getElementById("cart-window").classList.add('hidden');
}

function increaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decreaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
}

function showCheckoutConfirmation() {
    const confirmationDialog = document.getElementById("confirmation-dialog");
    confirmationDialog.classList.remove('hidden');
    confirmationDialog.style.display = 'flex';
}

function closeCheckoutConfirmation() {
    const confirmationDialog = document.getElementById("confirmation-dialog");
    confirmationDialog.classList.add('hidden');
    confirmationDialog.style.display = 'none';
}

function proceedToCheckout() {
    showCheckoutConfirmation();
}

async function confirmCheckout() {
    closeCheckoutConfirmation();
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
    const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
    const finalTotal = Math.max(0, subtotal - appliedDiscount);
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Get the current order number without incrementing
    const currentOrderNumber = getNextOrderNumber(false);

    // Display receipt first
    displayReceipt(finalTotal, currentOrderNumber);
    
    // Log the order and increment the order number
    logOrder(currentOrderNumber, finalTotal);
    
    // Increment the order number after everything is done
    getNextOrderNumber(true);

    // Process points for members
    if (user && user.id) {
        try {
            const response = await fetch('/api/rewards/calculate-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    orderAmount: finalTotal
                })
            });

            const data = await response.json();
            if (data.success) {
                // Update user points and UI
                user.points = data.newPoints;
                localStorage.setItem('user', JSON.stringify(user));
                document.getElementById('user-points').textContent = data.newPoints;
                
                // Add points message to receipt
                const tfoot = document.querySelector('#receipt-table tfoot');
                if (tfoot) {
                    const pointsRow = document.createElement('tr');
                    pointsRow.classList.add('points-earned-row');
                    pointsRow.innerHTML = `
                        <td colspan="6" style="text-align: right;"><strong>Points Earned:</strong></td>
                        <td colspan="2"><strong>+${data.pointsEarned} points</strong></td>
                    `;
                    tfoot.appendChild(pointsRow);
                }
            }
        } catch (error) {
            console.error('Error processing points:', error);
        }
    }
}

function closeConfirmation() {
    const confirmationDialog = document.getElementById("confirmation-dialog");
    confirmationDialog.style.display = 'none';
    confirmationDialog.classList.add('hidden');
}

function logOrder(currentOrderNumber, finalTotal) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const customerName = user.firstName ? `${user.firstName} ${user.lastName}` : 'Guest';

    const orderDetails = cart.map(item => {
        const sauceFees = item.sauces.length > 2 ? (item.sauces.length - 2) * 0.50 : 0;
        const extraFees = item.extras.reduce((total, extra) => {
            if (extra === 'Carrot') return total + 0.70;
            return total + 1.00;
        }, 0);
        const saladFees = item.salads.reduce((total, salad) => {
            if (salad === 'Tabbouli') return total + 1.00;
            if (salad === 'Carrot') return total + 0.70;
            return total;
        }, 0);
        const totalFees = sauceFees + extraFees + saladFees;
        
        // Get the drink details if it's a drink
        let drinkDetails = '';
        if (item.category === 'Drinks') {
            const drink = menuData.Drinks.find(d => d.name === item.title);
            if (drink?.details) {
                drinkDetails = drink.details.volume;
            }
        }

        return {
            category: item.category,
            title: item.title,
            size: item.category === 'Drinks' ? drinkDetails : item.size, // Use volume for drinks
            drinkVolume: drinkDetails, // Add drink volume as separate field
            quantity: item.quantity,
            price: item.price,
            sauces: item.sauces,
            extras: item.extras,
            salads: item.salads,
            addOns: totalFees.toFixed(2),
            extraa: 'Extra A Info',
            extrab: 'Extra B Info',
            extrac: 'Extra C Info'
        };
    });

    const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');

    const logEntry = {
        orderNumber: currentOrderNumber,
        orderTime: new Date().toLocaleString(),
        customerName: customerName, // Add customer name to the log
        items: orderDetails,
        subtotal: subtotal.toFixed(2),
        discount: appliedDiscount.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        status: 'new',
        lastUpdated: new Date().toLocaleString()
    };

    fetch('http://localhost:3000/logOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderDetails: JSON.stringify(logEntry) })
    }).catch(error => console.error('Error logging order:', error));
}

// Add status update function
async function updateOrderStatus(orderNumber, status) {
    try {
        const response = await fetch('/updateOrderStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderNumber, status })
        });

        if (!response.ok) throw new Error('Failed to update status');
        
        // Update UI to reflect new status
        updateOrderStatusUI(orderNumber, status);
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
    }
}

// Add UI update function for status changes
function updateOrderStatusUI(orderNumber, status) {
    const orderElement = document.querySelector(`[data-order-number="${orderNumber}"]`);
    if (orderElement) {
        // Update status display
        const statusDisplay = orderElement.querySelector('.order-status');
        if (statusDisplay) {
            statusDisplay.textContent = status;
            statusDisplay.className = `order-status ${status}`;
        }
        
        // Update status buttons visibility
        updateStatusButtons(orderElement, status);
    }
}

// Add status buttons handling
function updateStatusButtons(orderElement, currentStatus) {
    const buttonsContainer = orderElement.querySelector('.order-actions');
    if (!buttonsContainer) return;

    const statuses = ['new', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    if (currentIndex < statuses.length - 1) {
        const nextStatus = statuses[currentIndex + 1];
        buttonsContainer.innerHTML = `
            <button onclick="updateOrderStatus(${orderElement.dataset.orderNumber}, '${nextStatus}')" 
                    class="status-button ${nextStatus}">
                Mark as ${nextStatus}
            </button>
        `;
    } else {
        buttonsContainer.innerHTML = '<span class="completed-text">Order Completed</span>';
    }
}

function displayReceipt(finalCheckoutTotal, orderNumber) {
    const receiptModal = document.getElementById("receipt-modal");
    const receiptTable = document.getElementById("receipt-table");
    const orderTime = new Date().toLocaleString();
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
    const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
    const finalTotal = finalCheckoutTotal || Math.max(0, subtotal - appliedDiscount);
    const pointsRedeemed = appliedDiscount / 2 * 50; // Correctly calculate points redeemed

    // Clear any existing content first
    receiptTable.innerHTML = '';

    // Basic receipt header
    receiptTable.innerHTML = `
        <tr><th colspan="8">Order Number: ${orderNumber}</th></tr>
        <tr><th colspan="8">Order Time: ${orderTime}</th></tr>
        <tr>
            <th>Category - Item</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Original Price</th>
            <th>Sauces</th>
            <th>Extras</th>
            <th>Salads</th>
            <th>Add-ons</th>
        </tr>
    `;

    // Add cart items
    cart.forEach(item => {
        const sauceFees = item.sauces.length > 2 ? (item.sauces.length - 2) * 0.50 : 0;
        const extraFees = item.extras.reduce((total, extra) => {
            if (extra === 'Carrot') return total + 0.70;
            return total + 1.00;
        }, 0);
        const saladFees = item.salads.reduce((total, salad) => {
            if (salad === 'Tabbouli') return total + 1.00;
            if (salad === 'Carrot') return total + 0.70;
            return total;
        }, 0);
        const totalFees = sauceFees + extraFees + saladFees;
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.category} - ${item.title}</td>
            <td>${item.category === 'Drinks' ? item.drinkVolume : item.size}</td>
            <td>${item.quantity}</td>
            <td>$${item.price}</td>
            <td>${item.sauces.join(", ")}</td>
            <td>${item.extras.join(", ")}</td>
            <td>${item.salads.join(", ")}</td>
            <td>$${totalFees.toFixed(2)}</td>
        `;
        receiptTable.appendChild(row);
    });

    // Create total section
    const totalSection = document.createElement("tfoot");
    
    // Build total section based on whether points were redeemed
    let totalSectionHTML = `
        <tr>
            <td colspan="6" style="text-align: right;"><strong>${appliedDiscount > 0 ? 'Original ' : ''}Subtotal:</strong></td>
            <td colspan="2"><strong>$${subtotal.toFixed(2)}</strong></td>
        </tr>`;

    // Only add points-related rows if points were redeemed
    if (appliedDiscount > 0) {
        totalSectionHTML += `
            <tr class="points-info">
                <td colspan="6" style="text-align: right;"><strong>Points Redeemed:</strong></td>
                <td colspan="2"><strong>${pointsRedeemed} points</strong></td>
            </tr>
            <tr class="discount-row">
                <td colspan="6" style="text-align: right;"><strong>Points Discount:</strong></td>
                <td colspan="2"><strong>-$${appliedDiscount.toFixed(2)}</strong></td>
            </tr>
            <tr class="savings-row">
                <td colspan="8" style="text-align: center; color: #4CAF50;">
                    <i class="fas fa-piggy-bank"></i> You saved $${appliedDiscount.toFixed(2)} by redeeming points!
                </td>
            </tr>`;
    }

    // Always add final total
    totalSectionHTML += `
        <tr class="final-total">
            <td colspan="6" style="text-align: right;"><strong>Final Total:</strong></td>
            <td colspan="2"><strong><span class="total-price-amount">$${finalTotal.toFixed(2)}</span></strong></td>
        </tr>`;

    totalSection.innerHTML = totalSectionHTML;
    receiptTable.appendChild(totalSection);

    // Show receipt
    receiptModal.classList.remove("hidden");
    receiptModal.style.display = 'block';

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) { // Only show for members
        const saveButton = document.createElement('button');
        saveButton.className = 'save-quick-order-btn';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save as Quick Order';
        saveButton.onclick = saveQuickOrder;
        
        const buttonContainer = receiptModal.querySelector('.receipt-buttons');
        buttonContainer.insertBefore(saveButton, buttonContainer.firstChild);
    }
}

function closeReceipt() {
    const resetConfm = document.getElementById("confirmation-close-receipt-dialog");
    const receiptModal = document.getElementById("receipt-modal"); // Get receipt modal

    // Hide receipt modal first
    receiptModal.style.display = 'none';
    receiptModal.classList.add('hidden');
    
    // Show confirmation dialog
    resetConfm.classList.remove('hidden');
    resetConfm.style.display = 'flex';
    
    // Close any other dialogs
    closeConfirmation();
    closeCart();
}

function confirmCloseReceipt() {
    closeCart();
    
    // Reset receipt-related elements first
    const receiptTable = document.getElementById("receipt-table");
    if (receiptTable) {
        // Remove any existing points-related rows
        const pointsRows = receiptTable.querySelectorAll('.points-info, .discount-row, .savings-row');
        pointsRows.forEach(row => row.remove());
    }
    
    // Hide receipt modal
    const receiptModal = document.getElementById("receipt-modal");
    receiptModal.style.display = 'none';
    receiptModal.classList.add('hidden');
    
    // Hide confirmation dialog
    const comfirmCrD = document.getElementById("confirmation-close-receipt-dialog");
    comfirmCrD.style.display = 'none';
    comfirmCrD.classList.add('hidden');

    // Reset points and discounts
    localStorage.removeItem('appliedDiscount');
    const pointsRedemption = document.getElementById('points-redemption');
    if (pointsRedemption) {
        const availablePoints = pointsRedemption.querySelector('#available-points');
        const redeemableAmount = pointsRedemption.querySelector('#redeemable-amount');
        if (availablePoints) availablePoints.textContent = '0';
        if (redeemableAmount) redeemableAmount.textContent = '0.00';
    }
    
    // Clear cart and order data
    cart = [];
    totalCartCount = 0;
    orderType = '';
    
    // Update displays and hide screens
    logout()
    updateCart();
    closeCart();
    showAuthSelection();
    
    // Hide all relevant screens
    const screensToHide = [
        'main-container',
        'selection-screen',
        'user-profile',
        'continue-order-dialog',
        'product-view',
        'customization-window',
        'cart-window',
        'confirmation-dialog',
        'confirmation-close-receipt-dialog'
    ];
    
    screensToHide.forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

function cancelCloseReceipt() {
    // Hide confirmation dialog
    const resetConfm = document.getElementById("confirmation-close-receipt-dialog");
    resetConfm.classList.add('hidden');
    resetConfm.style.display = 'none';
    
    // Show receipt modal again
    const receiptModal = document.getElementById("receipt-modal");
    receiptModal.style.display = 'block';
    receiptModal.classList.remove('hidden');
}

function printReceipt() {
    const receiptContent = document.getElementById("receipt-table").outerHTML;
    const currentOrderNumber = orderNumber - 1; // Use the last order number
    const appliedDiscount = parseFloat(localStorage.getItem('appliedDiscount') || '0');
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Receipt</title>
            <style>
                @page { size: 80mm auto; margin: 0; }
                body { width: 80mm; margin: 0; font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 5px; text-align: left; font-size: 12px; }
                th { background-color: #f5f5f5; }
                h2 { text-align: center; font-size: 16px; }
                .discount-row { color: #4CAF50; font-style: italic; }
                .savings-message { 
                    text-align: center;
                    color: #4CAF50;
                    font-weight: bold;
                    padding: 10px 0;
                    border-top: 1px dashed #4CAF50;
                    border-bottom: 1px dashed #4CAF50;
                    margin: 10px 0;
                }
                .final-total { 
                    font-size: 14px;
                    font-weight: bold;
                    background-color: #f9f9f9;
                }
            </style>
        </head>
        <body>
            <h2>Order Receipt</h2>
            ${receiptContent}
            ${appliedDiscount > 0 ? `
                <div class="savings-message">
                    You saved $${appliedDiscount.toFixed(2)} using points!
                </div>
            ` : ''}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 1000);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Add click handler for option boxes
document.addEventListener('DOMContentLoaded', function() {
    const optionBoxes = document.querySelectorAll('.option-box');
    optionBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            // Ensure the updateTotalPrice function is called
            const event = new Event('change');
            checkbox.dispatchEvent(event);
        });
    });
});

// Add this after the DOMContentLoaded event listener
function updateSauceLabels() {
    const sauceCheckboxes = document.querySelectorAll('input[name="sauce"]');
    const selectedBoxes = Array.from(sauceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.closest('.option-box'));
    
    // First, reset all sauce boxes to paid state
    document.querySelectorAll('.option-box[data-sauce-type]').forEach(box => {
        const priceElement = box.querySelector('.option-price');
        const checkbox = box.querySelector('input[type="checkbox"]');
        
        if (checkbox.checked) {
            priceElement.textContent = '$0.50';
            box.classList.remove('free');
        } else {
            if (selectedBoxes.length < 2) {
                priceElement.textContent = 'Free';
                box.classList.add('free');
            } else {
                priceElement.textContent = '$0.50';
                box.classList.remove('free');
            }
        }
    });

    // Then, ensure first two selected boxes are marked as free
    selectedBoxes.slice(0, 2).forEach(box => {
        const priceElement = box.querySelector('.option-price');
        priceElement.textContent = 'Free';
        box.classList.add('free');
    });
}

// Modify the existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const optionBoxes = document.querySelectorAll('.option-box');
    optionBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            
            // Update sauce labels if this is a sauce option
            if (this.hasAttribute('data-sauce-type')) {
                updateSauceLabels();
            }
            
            // Ensure the updateTotalPrice function is called
            const event = new Event('change');
            checkbox.dispatchEvent(event);
        });
    });

    // Add flavor selection handler
    const flavorBoxes = document.querySelectorAll('#milkshake-flavors .option-box');
    flavorBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            // Remove selected class from all flavor boxes
            flavorBoxes.forEach(b => b.classList.remove('selected-flavor'));
            // Add selected class to clicked box
            this.classList.add('selected-flavor');
            
            // Ensure radio button is checked
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
});

function logout() {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
    
    // Clear cart and order data
    cart = [];
    totalCartCount = 0;
    orderType = '';
    
    // Hide all screens except auth selection
    document.getElementById('user-profile').classList.add('hidden');
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('main-container').classList.add('hidden');
    document.getElementById('auth-selection').classList.remove('hidden');
    
    // Clear order displays
    document.getElementById('order-details').innerText = 'No items selected';
    document.getElementById('cart-count').innerText = '0';
    
    // Update cart display
    updateCart();
    closeCart();
    
    // Show success message
    showSuccess('Logged out successfully!');
    
    // Reset all sections to initial state
    resetKioskState();
}

function resetKioskState() {
    // Clear any active customizations
    closeCustomization();
    
    // Reset product view
    const productView = document.getElementById("product-view");
    if (productView) {
        productView.classList.add('hidden');
    }
    
    // Reset menu grid
    const menuGrid = document.getElementById("menu-grid");
    if (menuGrid) {
        menuGrid.classList.remove('hidden');
    }
    
    // Hide back button
    const backButton = document.getElementById("back-button");
    if (backButton) {
        backButton.classList.add('hidden');
    }
}

function goBackToAuth() {
    

    const closerOfSS = document.getElementById("selection-screen");
    closerOfSS.style.display = 'none';
    closerOfSS.classList.add('hidden');
    // Hide selection screen
    document.getElementById('selection-screen').classList.add('hidden');
    
    // Show auth selection
    document.getElementById('auth-selection').classList.remove('hidden');
    
    // Clear user type
    localStorage.removeItem('userType');
    
    // Reset any user type display
    const userTypeDisplay = document.getElementById('user-type-display');
    if (userTypeDisplay) {
        userTypeDisplay.innerHTML = '';
    }
    logout()
}

async function redeemPoints() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const points = user.points || 0;
        
        if (!user.id || points < 50) {
            return;
        }
        
        const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price), 0);
        // Calculate maximum points that can be redeemed based on cart total
        const maxPointsForOrder = Math.floor(totalPrice / 0.04); // $0.04 = 1 point value
        const maxRedeemablePoints = Math.min(points, maxPointsForOrder);
        // Round down to nearest 50 points
        const pointsToRedeem = Math.floor(maxRedeemablePoints / 50) * 50;
        // Calculate actual discount amount, capped at total price
        const discountAmount = Math.min((pointsToRedeem / 50) * 2, totalPrice);

        // Create and show confirmation dialog
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="points-confirmation-overlay"></div>
            <div class="points-confirmation-dialog">
                <h2>Confirm Points Redemption</h2>
                <div class="points-confirmation-content">
                    <p>You are about to redeem:</p>
                    <div class="points-confirmation-value">${pointsToRedeem} Points</div>
                    <p>This will save you:</p>
                    <div class="points-confirmation-value">$${discountAmount.toFixed(2)}</div>
                    <p>Remaining points after redemption: ${points - pointsToRedeem}</p>
                </div>
                <div class="points-confirmation-buttons">
                    <button class="confirm-redeem">Confirm Redemption</button>
                    <button class="cancel-redeem">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // Handle confirmation or cancellation
        return new Promise((resolve, reject) => {
            const confirmBtn = dialog.querySelector('.confirm-redeem');
            const cancelBtn = dialog.querySelector('.cancel-redeem');
            const overlay = dialog.querySelector('.points-confirmation-overlay');

            const cleanup = () => {
                dialog.remove();
            };

            confirmBtn.addEventListener('click', async () => {
                cleanup();
                try {
                    const response = await fetch('/api/rewards/redeem', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            pointsToRedeem: pointsToRedeem,
                            discountAmount: discountAmount
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to redeem points');
                    }

                    // Update user data and UI
                    user.points = data.newPoints;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('appliedDiscount', discountAmount.toString());
                    document.getElementById('user-points').textContent = data.newPoints;
                    
                    // Immediately refresh cart display to show discount
                    closeCart();
                    openCart();
                    
                    // Disable redeem button
                    const redeemButton = document.getElementById('redeem-points-btn');
                    if (redeemButton) {
                        redeemButton.disabled = true;
                        redeemButton.style.display = 'none';
                    }
                    
                    resolve();
                } catch (error) {
                    console.error('Error redeeming points:', error);
                    alert('Failed to redeem points. Please try again.');
                    reject(error);
                }
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve();
            });

            overlay.addEventListener('click', () => {
                cleanup();
                resolve();
            });
        });

    } catch (error) {
        console.error('Error in points redemption:', error);
        alert('Failed to process points redemption');
    }
}

/* ...existing code... */

function createDrinkLabels(details) {
    const tags = details.tags.map(tag => 
        `<span class="drink-tag">${tag}</span>`
    ).join('');
    
    return `
        <div class="drink-details">
            <div class="drink-main-info">
                <span class="volume-badge">${details.volume}</span>
                <span class="type-badge">${details.type}</span>
            </div>
            <div class="drink-tags">
                ${tags}
            </div>
            ${details.nutritionInfo ? `
                <div class="nutrition-info">
                    ${Object.entries(details.nutritionInfo).map(([key, value]) => 
                        `<span class="nutrition-tag">${key}: ${value}</span>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function preloadDrinkImages() {
    const images = menuData.Drinks.map(drink => {
        const img = new Image();
        img.src = drink.image;
        return img;
    });
    return Promise.all(images.map(img => {
        return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
    }));
}


let keyboard = null;
let activeInput = null;

function initializeKeyboard() {
    if (document.getElementById('virtual-keyboard')) return; // Prevent duplicate keyboards
    
    const keyboardWrapper = document.createElement('div');
    keyboardWrapper.className = 'virtual-keyboard';
    keyboardWrapper.id = 'virtual-keyboard';
    keyboardWrapper.style.display = 'none';

    // Add click handler to prevent keyboard from closing when clicking inside
    keyboardWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    const layout = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        ['@', '.', 'Space', 'Backspace'],
        ['Done']
    ];

    layout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyButton = document.createElement('div');
            keyButton.className = 'key';
            if (key === 'Space') keyButton.classList.add('space');
            if (key === 'Backspace') keyButton.classList.add('backspace');
            if (key === 'Done') keyButton.classList.add('done');
            keyButton.textContent = key;
            
            keyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!activeInput) return;
                
                switch (key) {
                    case 'Backspace':
                        activeInput.value = activeInput.value.slice(0, -1);
                        break;
                    case 'Space':
                        activeInput.value += ' ';
                        break;
                    case 'Done':
                        hideKeyboard();
                        break;
                    default:
                        activeInput.value += key;
                }
                
                activeInput.dispatchEvent(new Event('input'));
            });
            
            keyboardRow.appendChild(keyButton);
        });
        
        keyboardWrapper.appendChild(keyboardRow);
    });

    document.body.appendChild(keyboardWrapper);

    // Add global click handler to hide keyboard
    document.addEventListener('click', (e) => {
        const keyboard = document.getElementById('virtual-keyboard');
        const isKeyboard = e.target.closest('.virtual-keyboard');
        const isInput = e.target.id === 'quick-order-name';
        
        if (!isKeyboard && !isInput && keyboard) {
            keyboard.style.display = 'none';
            activeInput = null;
        }
    });
}

function showKeyboard(input) {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard || !input) return;

    // Remove any existing focus/click handlers from the input
    input.removeEventListener('focus', showKeyboard);
    input.removeEventListener('click', showKeyboard);

    activeInput = input;
    keyboard.style.display = 'block';
    keyboard.style.position = 'fixed';
    keyboard.style.bottom = '0';
    keyboard.style.left = '0';
    keyboard.style.width = '100%';
    keyboard.style.zIndex = '10003';

    // Prevent default keyboard
    input.blur();

    // Add click handler to the input
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        showKeyboard(input);
    });

    // Scroll input into view
    setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function hideKeyboard() {
    const keyboard = document.getElementById('virtual-keyboard');
    if (keyboard) {
        keyboard.style.display = 'none';
        activeInput = null;
    }
}
function updateCategoryBasedSections(customizationContent) {
    const category = customizationContent.getAttribute('data-category');
    
    // Get the sections
    const sauceSection = document.querySelector('.customization-content div:has(input[name="sauce"])');
    const saladSection = document.querySelector('.customization-content div:has(input[name="salad"])');
    const extrasSection = document.querySelector('.customization-content div:has(input[name="extra"])');
    
    if (category === 'Borek') {
        // Only show sauces for Borek
        if (sauceSection) sauceSection.style.display = 'block';
        if (saladSection) saladSection.style.display = 'none';
        if (extrasSection) extrasSection.style.display = 'none';
    }
}

// Modify showCustomization to call this function
document.addEventListener('DOMContentLoaded', () => {
    const customizationContent = document.querySelector('.customization-content');
    if (customizationContent) {
        // Create observer to watch for data-category changes
        const observer = new MutationObserver(() => {
            updateCategoryBasedSections(customizationContent);
        });
        
        observer.observe(customizationContent, {
            attributes: true,
            attributeFilter: ['data-category']
        });
    }
});
// Update event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeKeyboard();
    
    // Add click handler for search input
    document.addEventListener('click', (e) => {
        const searchInput = document.getElementById('drink-search');
        const keyboard = document.getElementById('virtual-keyboard');
        
        if (searchInput && e.target === searchInput) {
            e.preventDefault();
            showKeyboard(searchInput);
        } else if (keyboard && !keyboard.contains(e.target)) {
            hideKeyboard();
        }
    });

    // Prevent default keyboard on mobile
    const searchInput = document.getElementById('drink-search');
    if (searchInput) {
        searchInput.addEventListener('focus', (e) => {
            e.preventDefault();
            showKeyboard(searchInput);
        });
    }
});

// Add this function to save quick orders
function saveQuickOrder() {
    // Check if quick order has already been saved
    const receiptModal = document.getElementById("receipt-modal");
    const existingSaveBtn = receiptModal.querySelector('.save-quick-order-btn');
    if (existingSaveBtn && existingSaveBtn.disabled) {
        return; // Already saved
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const quickOrderDialog = document.createElement('div');
    quickOrderDialog.className = 'quick-order-dialog';
    quickOrderDialog.innerHTML = `
        <div class="quick-order-content">
            <h2>Save as Quick Order</h2>
            <p>Save this order for quick reordering next time!</p>
            <input type="text" id="quick-order-name" placeholder="Touch here to name your order">
            <div class="quick-order-buttons">
                <button class="save-quick-order">Save</button>
                <button class="cancel-quick-order">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(quickOrderDialog);

    const saveBtn = quickOrderDialog.querySelector('.save-quick-order');
    const cancelBtn = quickOrderDialog.querySelector('.cancel-quick-order');
    const nameInput = quickOrderDialog.querySelector('#quick-order-name');

    // Show keyboard immediately when dialog opens
    setTimeout(() => {
        showKeyboard(nameInput);
        nameInput.focus();
    }, 100);

    // Add touch/click handler for keyboard
    nameInput.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showKeyboard(nameInput);
    });

    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a name for this order');
            return;
        }

        hideKeyboard();
        // Save to localStorage
        const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
        userQuickOrders[name] = {
            items: cart,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`quickOrders_${user.id}`, JSON.stringify(userQuickOrders));
        
        // Disable the save button in receipt modal
        if (existingSaveBtn) {
            existingSaveBtn.disabled = true;
            existingSaveBtn.style.opacity = '0.5';
            existingSaveBtn.style.cursor = 'not-allowed';
        }
        
        quickOrderDialog.remove();
        showSuccessDialog('Quick order saved successfully!');
    };

    cancelBtn.onclick = () => {
        hideKeyboard();
        quickOrderDialog.remove();
    };

    // Prevent dialog from closing when clicking input
    quickOrderDialog.addEventListener('click', (e) => {
        if (e.target === quickOrderDialog) {
            hideKeyboard();
            quickOrderDialog.remove();
        }
    });
}

// Add this function to load quick orders
function showQuickOrders() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
    
    const quickOrdersDialog = document.createElement('div');
    quickOrdersDialog.className = 'quick-orders-dialog';
    
    let ordersHtml = Object.entries(userQuickOrders)
        .map(([name, order]) => `
            <div class="quick-order-item">
                <div class="quick-order-info">
                    <h3>${name}</h3>
                    <p>${order.items.length} items - Last ordered: ${new Date(order.timestamp).toLocaleDateString()}</p>
                </div>
                <button onclick="loadQuickOrder('${name}')">Order Again</button>
            </div>
        `).join('') || '<p>No saved orders yet</p>';

    quickOrdersDialog.innerHTML = `
        <div class="quick-orders-content">
            <h2>Your Quick Orders</h2>
            <div class="quick-orders-list">
                ${ordersHtml}
            </div>
            <button class="close-quick-orders">Close</button>
        </div>
    `;
}

// Add this function to load a quick order
function loadQuickOrder(name) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
    const order = userQuickOrders[name];
    
    if (order) {
        // Clear existing cart first
        cart = [];
        totalCartCount = 0;
        
        // Load the saved order into cart
        cart = [...order.items];
        totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Close quick orders dialog first
        document.querySelector('.quick-orders-dialog').remove();

        // Show loading confirmation dialog
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="points-confirmation-overlay"></div>
            <div class="points-confirmation-dialog">
                <h2><i class="fas fa-shopping-cart" style="color: #4CAF50"></i> Order Added</h2>
                <div class="points-confirmation-content">
                    <p>"${name}" has been added to your cart</p>
                    <div class="points-confirmation-value">${totalCartCount} items</div>
                </div>
                <div class="points-confirmation-buttons">
                    <button class="confirm-redeem" onclick="viewCart()">View Cart</button>
                    <button class="cancel-redeem" onclick="continueOrdering()">Continue Ordering</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // Update cart in background
        updateCart();
    }
}

function viewCart() {
    // Remove the confirmation dialog
    const dialog = document.querySelector('.points-confirmation-dialog');
    const overlay = document.querySelector('.points-confirmation-overlay');
    if (dialog) dialog.parentElement.remove();
    if (overlay) overlay.remove();
    
    // Open the cart
    openCart();
}

function continueOrdering() {
    // Remove the confirmation dialog
    const dialog = document.querySelector('.points-confirmation-dialog');
    const overlay = document.querySelector('.points-confirmation-overlay');
    if (dialog) dialog.parentElement.remove();
    if (overlay) overlay.remove();
}

// Add Quick Orders button to profile section
const userProfile = document.querySelector('.profile-header');
if (userProfile) {
    const quickOrdersBtn = document.createElement('button');
    quickOrdersBtn.className = 'quick-orders-btn';
    quickOrdersBtn.onclick = showQuickOrders;
    userProfile.appendChild(quickOrdersBtn);
    
}

// ...existing code...

function showQuickOrders() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
    
    const quickOrdersDialog = document.createElement('div');
    quickOrdersDialog.className = 'quick-orders-dialog';
    
    let ordersHtml = Object.entries(userQuickOrders).length > 0 
        ? Object.entries(userQuickOrders)
            .map(([name, order]) => `
                <div class="quick-order-item">
                    <div class="quick-order-info">
                        <h3>${name}</h3>
                        <p>${order.items.length} items - Last ordered: ${new Date(order.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div class="quick-order-actions">
                        <button class="order-again-btn" onclick="loadQuickOrder('${name}')">
                            <i class="fas fa-shopping-cart"></i> Order Again
                        </button>
                        <button class="delete-order-btn" onclick="deleteQuickOrder('${name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')
        : '<div class="no-orders-message"><i class="fas fa-folder-open"></i> No saved orders yet</div>';

    quickOrdersDialog.innerHTML = `
        <div class="quick-orders-content">
            <h2><i class="fas fa-clock"></i> Your Quick Orders</h2>
            <div class="quick-orders-list">
                ${ordersHtml}
            </div>
            <button class="close-quick-orders" onclick="closeQuickOrders()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
   

    document.body.appendChild(quickOrdersDialog);
}

function deleteQuickOrder(name) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    // Create and show confirmation dialog
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div class="points-confirmation-overlay"></div>
        <div class="points-confirmation-dialog">
            <h2><i class="fas fa-trash" style="color: #dc3545"></i> Delete Quick Order</h2>
            <div class="points-confirmation-content">
                <p>Are you sure you want to delete:</p>
                <div class="points-confirmation-value">"${name}"</div>
                <p>This action cannot be undone.</p>
            </div>
            <div class="points-confirmation-buttons">
                <button class="confirm-redeem" style="background: #dc3545">Delete</button>
                <button class="cancel-redeem">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    // Handle button clicks
    const confirmBtn = dialog.querySelector('.confirm-redeem');
    const cancelBtn = dialog.querySelector('.cancel-redeem');
    const overlay = dialog.querySelector('.points-confirmation-overlay');

    const cleanup = () => {
        dialog.remove();
    };

    confirmBtn.onclick = () => {
        const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
        delete userQuickOrders[name];
        localStorage.setItem(`quickOrders_${user.id}`, JSON.stringify(userQuickOrders));
        
        cleanup();
        
        // Show success message
        showSuccessDialog('Quick order deleted successfully!');
        
        // Refresh the quick orders display
        const quickOrdersDialog = document.querySelector('.quick-orders-dialog');
        if (quickOrdersDialog) {
            quickOrdersDialog.remove();
            showQuickOrders();
        }
    };

    cancelBtn.onclick = cleanup;
    overlay.onclick = cleanup;
}

function closeQuickOrders() {
    const dialog = document.querySelector('.quick-orders-dialog');
    if (dialog) {
        dialog.style.opacity = '0';
        dialog.style.transform = 'scale(0.95)';
        setTimeout(() => dialog.remove(), 200);
        // Don't open cart when closing quick orders
    }
}

// ...existing code...

// Add this at the end of the first DOMContentLoaded event listener:
document.addEventListener('DOMContentLoaded', () => {
    // ...existing initialization code...

    // Add profile menu toggle functionality
    const userProfile = document.querySelector('.profile-header');
    if (userProfile) {
        userProfile.innerHTML += `
            <button class="profile-toggle-btn" onclick="toggleProfileMenu(event)">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="user-profile-menu">
                <button class="profile-menu-item" onclick="showQuickOrders()">
                    <i class="fas fa-clock"></i>
                    Quick Orders
                </button>
                <button class="profile-menu-item danger" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        `;

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const menu = document.querySelector('.user-profile-menu');
            const toggleBtn = document.querySelector('.profile-toggle-btn');
            if (menu && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
});

function toggleProfileMenu(event) {
    event.stopPropagation();
    const menu = document.querySelector('.user-profile-menu');
    menu.classList.toggle('show');
}

// Remove the old Quick Orders button creation code:
/*
const userProfile = document.querySelector('.profile-header');
if (userProfile) {
    const quickOrdersBtn = document.createElement('button');
    quickOrdersBtn.className = 'quick-orders-btn';
    quickOrdersBtn.innerHTML = '<i class="fas fa-clock"></i> Quick Orders';
    quickOrdersBtn.onclick = showQuickOrders;
    userProfile.appendChild(quickOrdersBtn);
}
*/

// ...existing code...

function saveQuickOrder() {
    // Check if quick order has already been saved
    const receiptModal = document.getElementById("receipt-modal");
    const existingSaveBtn = receiptModal.querySelector('.save-quick-order-btn');
    if (existingSaveBtn && existingSaveBtn.disabled) {
        return; // Already saved
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const quickOrderDialog = document.createElement('div');
    quickOrderDialog.className = 'quick-order-dialog';
    quickOrderDialog.innerHTML = `
        <div class="quick-order-content">
            <h2>Save as Quick Order</h2>
            <p>Save this order for quick reordering next time!</p>
            <input type="text" id="quick-order-name" placeholder="Touch here to name your order">
            <div class="quick-order-buttons">
                <button class="save-quick-order">Save</button>
                <button class="cancel-quick-order">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(quickOrderDialog);

    const saveBtn = quickOrderDialog.querySelector('.save-quick-order');
    const cancelBtn = quickOrderDialog.querySelector('.cancel-quick-order');
    const nameInput = quickOrderDialog.querySelector('#quick-order-name');

    // Add keyboard trigger on input focus
    nameInput.addEventListener('focus', (e) => {
        e.preventDefault();
        showKeyboard(nameInput);
    });

    // Add keyboard trigger on input click
    nameInput.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showKeyboard(nameInput);
    });

    // Force focus and show keyboard on dialog open
    setTimeout(() => {
        nameInput.focus();
        showKeyboard(nameInput);
    }, 100);

    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a name for this order');
            return;
        }

        hideKeyboard();
        const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
        userQuickOrders[name] = {
            items: cart,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`quickOrders_${user.id}`, JSON.stringify(userQuickOrders));
        
        // Disable the save button in receipt modal
        if (existingSaveBtn) {
            existingSaveBtn.disabled = true;
            existingSaveBtn.style.opacity = '0.5';
            existingSaveBtn.style.cursor = 'not-allowed';
        }
        
        quickOrderDialog.remove();
        showSuccessDialog('Quick order saved successfully!');
    };

    cancelBtn.onclick = () => {
        hideKeyboard();
        quickOrderDialog.remove();
    };

    // Close dialog when clicking outside but keep keyboard if clicking input
    quickOrderDialog.addEventListener('click', (e) => {
        if (e.target === quickOrderDialog) {
            hideKeyboard();
            quickOrderDialog.remove();
        }
    });
}

function showKeyboard(input) {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard || !input) return;

    activeInput = input;
    keyboard.style.display = 'block';
    keyboard.style.position = 'fixed';
    keyboard.style.bottom = '0';
    keyboard.style.left = '0';
    keyboard.style.width = '100%';
    keyboard.style.zIndex = '10003'; // Higher z-index to appear above dialog

    // Scroll the input into view if needed
    setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// ...existing code...

function showSuccessDialog(message) {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div class="points-confirmation-overlay"></div>
        <div class="points-confirmation-dialog">
            <h2><i class="fas fa-check-circle" style="color: #4CAF50"></i> Success!</h2>
            <div class="points-confirmation-content">
                <div class="points-confirmation-value">${message}</div>
            </div>
            <div class="points-confirmation-buttons">
                <button class="confirm-redeem">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    // Auto-close after 2 seconds
    setTimeout(() => {
        dialog.remove();
    }, 2000);

    // Also close on button click or overlay click
    const confirmBtn = dialog.querySelector('.confirm-redeem');
    const overlay = dialog.querySelector('.points-confirmation-overlay');
    
    confirmBtn.onclick = () => dialog.remove();
    overlay.onclick = () => dialog.remove();
}

// ...existing code...

function loadQuickOrder(name) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userQuickOrders = JSON.parse(localStorage.getItem(`quickOrders_${user.id}`) || '{}');
    const order = userQuickOrders[name];
    
    if (order) {
        // Clear existing cart first
        cart = [];
        totalCartCount = 0;
        
        // Load the saved order into cart
        cart = [...order.items];
        totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Close quick orders dialog first
        document.querySelector('.quick-orders-dialog').remove();

        // Show loading confirmation dialog
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="points-confirmation-overlay"></div>
            <div class="points-confirmation-dialog">
                <h2><i class="fas fa-shopping-cart" style="color: #4CAF50"></i> Order Added</h2>
                <div class="points-confirmation-content">
                    <p>"${name}" has been added to your cart</p>
                    <div class="points-confirmation-value">${totalCartCount} items</div>
                </div>
                <div class="points-confirmation-buttons">
                    <button class="confirm-redeem" onclick="viewCart()">View Cart</button>
                    <button class="cancel-redeem" onclick="continueOrdering()">Continue Ordering</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // Update cart in background
        updateCart();
    }
}

function viewCart() {
    // Remove the confirmation dialog
    const dialog = document.querySelector('.points-confirmation-dialog');
    const overlay = document.querySelector('.points-confirmation-overlay');
    if (dialog) dialog.parentElement.remove();
    if (overlay) overlay.remove();
    
    // Open the cart
    openCart();
}

function continueOrdering() {
    // Remove the confirmation dialog
    const dialog = document.querySelector('.points-confirmation-dialog');
    const overlay = document.querySelector('.points-confirmation-overlay');
    if (dialog) dialog.parentElement.remove();
    if (overlay) overlay.remove();
}

// ...existing code...
