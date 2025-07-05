
document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    let basePrice = 0;
    let addonPrice = 0;
    let travelPrice = 0;
    let discountAmount = 0;
    let selectedServices = [];
    let selectedAddons = [];
    let selectedDiscounts = [];

    // Appliance selection
    const applianceOptions = document.querySelectorAll('#booking .appliance-option[data-service]');
    applianceOptions.forEach(option => {
        option.addEventListener('click', function () {
            this.classList.toggle('selected');
            updatePrices();
        });
    });

    // Combo package selection
    const comboButtons = document.querySelectorAll('.select-combo');
    comboButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            // Clear previous selections
            applianceOptions.forEach(opt => opt.classList.remove('selected'));

            // Select appropriate services based on combo
            const combo = this.dataset.combo;
            if (combo === 'basic') {
                document.querySelector('[data-service="fridge"]').classList.add('selected');
                document.querySelector('[data-service="oven-single"]').classList.add('selected');
                document.querySelector('[data-service="microwave"]').classList.add('selected');
            } else if (combo === 'kitchen') {
                document.querySelector('[data-service="oven-single"]').classList.add('selected');
                document.querySelector('[data-service="hood"]').classList.add('selected');
                document.querySelector('[data-service="dishwasher"]').classList.add('selected');
            } else if (combo === 'laundry') {
                document.querySelector('[data-service="washing"]').classList.add('selected');
                // Assuming dryer is same as washing machine for this demo
                document.querySelector('[data-service="aircon"]').classList.add('selected');
            } else if (combo === 'fullhouse') {
                document.querySelector('[data-service="fridge"]').classList.add('selected');
                document.querySelector('[data-service="oven-single"]').classList.add('selected');
                document.querySelector('[data-service="washing"]').classList.add('selected');
                document.querySelector('[data-service="microwave"]').classList.add('selected');
                document.querySelector('[data-service="hood"]').classList.add('selected');
            }

            updatePrices();
            // Scroll to booking form
            document.getElementById('final-amount').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Location selection
    const locationOptions = document.querySelectorAll('.location-option');
    locationOptions.forEach(option => {
        option.addEventListener('click', function () {
            locationOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updatePrices();
        });
    });

    // Discount checkboxes
    const discountCheckboxes = document.querySelectorAll('input[type="checkbox"][name="discount"]');
    discountCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePrices);
    });

    // Form submission
    const bookingForm = document.getElementById('booking-form');
    const confirmationSection = document.getElementById('confirmation');
    const bookingSummary = document.getElementById('booking-summary');
    const newBookingBtn = document.getElementById('new-booking');

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate at least one appliance is selected
        const selectedAppliances = document.querySelectorAll('#booking .appliance-option[data-service].selected');
        if (selectedAppliances.length === 0) {
            alert('Please select at least one appliance to clean.');
            return;
        }

        // Create booking summary
        let summaryHTML = `
            <div class="summary-item">
                <span class="summary-title">Name:</span>
                <span class="summary-value">${document.getElementById('name').value}</span>
            </div>
            <div class="summary-item">
                <span class="summary-title">Phone:</span>
                <span class="summary-value">${document.getElementById('phone').value}</span>
            </div>
            <div class="summary-item">
                <span class="summary-title">Address:</span>
                <span class="summary-value">${document.getElementById('address').value}</span>
            </div>
            <div class="summary-item">
                <span class="summary-title">Date:</span>
                <span class="summary-value">${document.getElementById('date').value}</span>
            </div>
            <div class="summary-item">
                <span class="summary-title">Time:</span>
                <span class="summary-value">${document.getElementById('time').options[document.getElementById('time').selectedIndex].text}</span>
            </div>
            <div class="summary-item">
                <span class="summary-title">Services:</span>
                <span class="summary-value">${selectedServices.join(', ')}</span>
            </div>`;

        if (selectedAddons.length > 0) {
            summaryHTML += `
            <div class="summary-item">
                <span class="summary-title">Add-ons:</span>
                <span class="summary-value">${selectedAddons.join(', ')}</span>
            </div>`;
        }

        if (selectedDiscounts.length > 0) {
            summaryHTML += `
            <div class="summary-item">
                <span class="summary-title">Discounts:</span>
                <span class="summary-value">${selectedDiscounts.join(', ')}</span>
            </div>`;
        }

        summaryHTML += `
            <div class="summary-item" style="font-weight: bold; margin-top: 1rem;">
                <span class="summary-title">Total Amount:</span>
                <span class="summary-value">€${calculateTotal().toFixed(2)}</span>
            </div>`;

        bookingSummary.innerHTML = summaryHTML;

        // Prepare WhatsApp message
        const whatsappMessage = `New Booking Request:%0A%0A*Name:* ${document.getElementById('name').value}%0A*Phone:* ${document.getElementById('phone').value}%0A*Email:* ${document.getElementById('email').value}%0A*Address:* ${document.getElementById('address').value}%0A*Date:* ${document.getElementById('date').value}%0A*Time:* ${document.getElementById('time').options[document.getElementById('time').selectedIndex].text}%0A*Services:* ${selectedServices.join(', ')}%0A*Add-ons:* ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}%0A*Discounts:* ${selectedDiscounts.length > 0 ? selectedDiscounts.join(', ') : 'None'}%0A*Total Amount:* €${calculateTotal().toFixed(2)}`;

        // Send WhatsApp message (in a real app, you would use your business number)
        window.open(`https://wa.me/8801861677258?text=${whatsappMessage}`, '_blank');

        // Show confirmation and hide form
        bookingForm.classList.add('hidden');
        confirmationSection.classList.remove('hidden');
        confirmationSection.scrollIntoView({ behavior: 'smooth' });

        // Reset form for potential new bookings
        bookingForm.reset();
        applianceOptions.forEach(opt => opt.classList.remove('selected'));
        locationOptions.forEach(opt => opt.classList.remove('selected'));
        locationOptions[0].classList.add('selected');
        discountCheckboxes.forEach(cb => cb.checked = false);

        // Reset prices
        basePrice = 0;
        addonPrice = 0;
        travelPrice = 0;
        discountAmount = 0;
        selectedServices = [];
        selectedAddons = [];
        selectedDiscounts = [];

        updatePriceDisplays();
    });

    newBookingBtn.addEventListener('click', function () {
        // Show form and hide confirmation
        confirmationSection.classList.add('hidden');
        bookingForm.classList.remove('hidden');
        bookingForm.scrollIntoView({ behavior: 'smooth' });
    });

    // Function to update all prices
    function updatePrices() {
        // Reset
        basePrice = 0;
        addonPrice = 0;
        selectedServices = [];
        selectedAddons = [];
        selectedDiscounts = [];

        // Calculate base price from selected appliances
        const selectedAppliances = document.querySelectorAll('#booking .appliance-option[data-service].selected');
        selectedAppliances.forEach(appliance => {
            const service = appliance.dataset.service;
            const price = parseFloat(appliance.dataset.price);
            basePrice += price;

            // Add to selected services list
            const serviceName = appliance.querySelector('.appliance-name').textContent;
            selectedServices.push(serviceName);
        });

        // Calculate addon prices
        const selectedAddonOptions = document.querySelectorAll('#addons .appliance-option[data-service].selected');
        selectedAddonOptions.forEach(addon => {
            const service = addon.dataset.service;
            const price = parseFloat(addon.dataset.price);
            addonPrice += price;

            // Add to selected addons list
            const addonName = addon.querySelector('.appliance-name').textContent;
            selectedAddons.push(addonName);
        });

        // Calculate travel price
        const selectedLocation = document.querySelector('.location-option.selected input').value;
        if (selectedLocation === 'city') {
            travelPrice = 0;
        } else if (selectedLocation === 'nearby') {
            travelPrice = 5; // Default to €5, could be adjusted based on exact location
        } else {
            travelPrice = 15; // Default remote charge, would normally be custom
        }

        // Calculate discounts
        discountAmount = 0;
        const checkedDiscounts = document.querySelectorAll('input[type="checkbox"][name="discount"]:checked');
        checkedDiscounts.forEach(discount => {
            const value = discount.value;

            if (value === '10%') {
                if (basePrice + addonPrice >= 50) { // Min €50 booking for first-time discount
                    discountAmount += (basePrice + addonPrice) * 0.1;
                    selectedDiscounts.push('First-time Customer (10%)');
                }
            } else if (value === '15') {
                discountAmount += 15;
                selectedDiscounts.push('Repeat Customer (€15 off)');
            } else if (value === '15%') {
                discountAmount += (basePrice + addonPrice) * 0.15;
                selectedDiscounts.push('Monthly Subscription (15%)');
            } else if (value === 'free-travel') {
                discountAmount += travelPrice;
                travelPrice = 0;
                selectedDiscounts.push('Multiple Locations (Free travel)');
            }
        });

        // Update price displays
        updatePriceDisplays();
    }

    function updatePriceDisplays() {
        document.getElementById('base-price').textContent = `€${basePrice.toFixed(2)}`;
        document.getElementById('addon-price').textContent = `€${addonPrice.toFixed(2)}`;
        document.getElementById('travel-price').textContent = travelPrice > 0 ? `€${travelPrice.toFixed(2)}` : 'Free';
        document.getElementById('discount-price').textContent = `-€${discountAmount.toFixed(2)}`;

        const total = calculateTotal();
        document.getElementById('total-price').textContent = `€${total.toFixed(2)}`;
        document.getElementById('final-amount').textContent = `€${total.toFixed(2)}`;
    }

    function calculateTotal() {
        let total = basePrice + addonPrice + travelPrice - discountAmount;
        // Ensure total doesn't go below 0
        return Math.max(total, 0);
    }

    // Initialize with city selected
    document.querySelector('.location-option input[value="city"]').parentElement.classList.add('selected');
});

// Simple testimonial slider
let testimonialIndex = 0;
const testimonialSlider = document.querySelector('.testimonial-slider');

function slideTestimonials() {
    testimonialIndex = (testimonialIndex + 1) % 4; // Assuming 4 testimonials
    const scrollAmount = testimonialIndex * 320; // 300px card + 20px gap
    testimonialSlider.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Auto-slide every 5 seconds
setInterval(slideTestimonials, 5000);
