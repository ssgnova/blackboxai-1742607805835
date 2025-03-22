// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Global variables
let habits = [];
const STORAGE_KEY = 'dailyHabits';

function initializeApp() {
    loadHabits();
    setupEventListeners();
    renderHabits();
    checkEmptyState();
}

function setupEventListeners() {
    // Form submission for new habits
    document.getElementById('habitForm').addEventListener('submit', handleNewHabit);
    
    // Edit habit form submission
    document.getElementById('editHabitForm').addEventListener('submit', handleEditHabit);
    
    // Sort and filter buttons
    document.getElementById('sortButton').addEventListener('click', toggleSort);
    document.getElementById('filterButton').addEventListener('click', toggleFilter);
}

function loadHabits() {
    const storedHabits = localStorage.getItem(STORAGE_KEY);
    habits = storedHabits ? JSON.parse(storedHabits) : [];
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function handleNewHabit(e) {
    e.preventDefault();
    
    const title = document.getElementById('habitTitle').value.trim();
    const description = document.getElementById('habitDescription').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!title) {
        showToast('Please enter a habit title', 'error');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        title,
        description,
        frequency,
        createdAt: new Date().toISOString(),
        completedDates: [],
        streak: 0
    };
    
    habits.unshift(newHabit);
    saveHabits();
    renderHabits();
    checkEmptyState();
    
    // Reset form
    document.getElementById('habitForm').reset();
    showToast('Habit added successfully!', 'success');
}

function renderHabits() {
    const container = document.getElementById('habitsContainer');
    container.innerHTML = '';
    
    habits.forEach(habit => {
        const card = createHabitCard(habit);
        container.appendChild(card);
    });
}

function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card bg-white rounded-lg shadow-md p-6 relative';
    
    const today = new Date().toDateString();
    const isCompletedToday = habit.completedDates.includes(today);
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-800">${habit.title}</h3>
            <div class="flex space-x-2">
                <button onclick="editHabit(${habit.id})" class="text-gray-600 hover:text-indigo-600">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteHabit(${habit.id})" class="text-gray-600 hover:text-red-600">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="text-gray-600 mb-4">${habit.description || 'No description provided'}</p>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
                <i class="fas fa-clock mr-1"></i>
                ${habit.frequency}
            </span>
            <span class="text-sm text-gray-500">
                <i class="fas fa-fire mr-1"></i>
                Streak: ${habit.streak} days
            </span>
        </div>
        <button 
            onclick="toggleHabitCompletion(${habit.id})" 
            class="mt-4 w-full ${isCompletedToday ? 'bg-green-500' : 'bg-gray-200'} text-white py-2 rounded-lg hover:opacity-90 transition duration-300"
        >
            <i class="fas ${isCompletedToday ? 'fa-check-circle' : 'fa-circle'} mr-2"></i>
            ${isCompletedToday ? 'Completed' : 'Mark as Complete'}
        </button>
    `;
    
    return card;
}

function toggleHabitCompletion(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toDateString();
    const completedIndex = habit.completedDates.indexOf(today);
    
    if (completedIndex === -1) {
        habit.completedDates.push(today);
        habit.streak++;
        showToast('Habit marked as complete!', 'success');
    } else {
        habit.completedDates.splice(completedIndex, 1);
        habit.streak = Math.max(0, habit.streak - 1);
        showToast('Habit marked as incomplete', 'info');
    }
    
    saveHabits();
    renderHabits();
}

function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    habits = habits.filter(h => h.id !== habitId);
    saveHabits();
    renderHabits();
    checkEmptyState();
    showToast('Habit deleted successfully', 'success');
}

function editHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Populate edit form
    document.getElementById('editHabitId').value = habit.id;
    document.getElementById('editHabitTitle').value = habit.title;
    document.getElementById('editHabitDescription').value = habit.description;
    document.getElementById('editHabitFrequency').value = habit.frequency;
    
    // Show modal
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function handleEditHabit(e) {
    e.preventDefault();
    
    const habitId = parseInt(document.getElementById('editHabitId').value);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    habit.title = document.getElementById('editHabitTitle').value.trim();
    habit.description = document.getElementById('editHabitDescription').value.trim();
    habit.frequency = document.getElementById('editHabitFrequency').value;
    
    saveHabits();
    renderHabits();
    closeEditModal();
    showToast('Habit updated successfully', 'success');
}

function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    emptyState.classList.toggle('hidden', habits.length > 0);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Set icon and color based on type
    const iconMap = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-exclamation-circle text-red-500',
        info: 'fas fa-info-circle text-blue-500'
    };
    
    toastIcon.className = iconMap[type] || iconMap.info;
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function toggleSort() {
    habits.sort((a, b) => a.title.localeCompare(b.title));
    renderHabits();
    showToast('Habits sorted alphabetically', 'info');
}

function toggleFilter() {
    const today = new Date().toDateString();
    habits.sort((a, b) => {
        const aCompleted = a.completedDates.includes(today);
        const bCompleted = b.completedDates.includes(today);
        return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1;
    });
    renderHabits();
    showToast('Habits filtered by completion status', 'info');
}