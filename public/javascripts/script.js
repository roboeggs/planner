document.addEventListener('DOMContentLoaded', () => {
    const promptForm = document.getElementById('promptForm');
    const statusText = document.getElementById('status');
    const taskListContainer = document.querySelector('.task-list ul');
    const calendarContainer = document.querySelector('.calendar');

    promptForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const inputField = document.getElementById('generate');
        const prompt = inputField.value.trim();

        if (!prompt) return;

        statusText.innerText = 'Wait for it... processing is underway';

        try {
            const response = await fetch(`http://localhost:3000/prompt?prompt=${encodeURIComponent(prompt)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка сервера');
            }

            const responseData = await response.json();
            const data = responseData.data;

            // Обновляем DOM с новыми данными
            updateTaskList(data);
            updateCalendar(data); // Обновляем календарь
            statusText.innerText = 'Done!';
        } catch (error) {
            statusText.innerText = 'Request error: ' + error.message;
            console.error('Error:', error);
        }
    });

    // Функция для обновления списка задач
    function updateTaskList(data) {
        taskListContainer.innerHTML = ''; 

        if (data.subtasks) {
            data.subtasks.forEach(subtask => {
                const subtaskItem = document.createElement('li');
                subtaskItem.style.backgroundColor = getColorByComplexity(subtask.complexity);
                subtaskItem.classList.add('task-block');

                subtaskItem.innerHTML = `
                    <div>
                        <h3>${subtask.title}</h3>
                        <p>Description: ${subtask.description}</p>
                    </div>
                    <p class="time">Time in hours: ${subtask.estimated_time}</p>
                `;

                if (subtask.microtasks) {
                    const microtaskList = document.createElement('ul');
                    const microtaskHeader = document.createElement('h4');
                    microtaskHeader.textContent = "Microtask";
                    subtaskItem.appendChild(microtaskHeader);

                    subtask.microtasks.forEach(microtask => {
                        const microtaskItem = document.createElement('li');
                        microtaskItem.style.backgroundColor = getColorByComplexity(microtask.complexity);
                        microtaskItem.classList.add('task-block');

                        microtaskItem.innerHTML = `
                            <div>
                                <h3>${microtask.title}</h3>
                                <p>Description: ${microtask.description}</p>
                            </div>
                            <p class="time">Time in hours: ${microtask.estimated_time}</p>
                        `;

                        microtaskList.appendChild(microtaskItem);
                    });
                    subtaskItem.appendChild(microtaskList);
                }

                taskListContainer.appendChild(subtaskItem);
            });
        } else {
            taskListContainer.innerHTML = '<p>No subtasks available.</p>';
        }
    }

    function updateCalendar(data) {
        calendarContainer.innerHTML = '<h2>Calendar</h2>'; 

        if (data.subtasks) {
            data.subtasks.forEach(subtask => {
                const table = document.createElement('table');
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');

                // Создаем заголовок таблицы
                const headerRow = document.createElement('tr');
                ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(day => {
                    const th = document.createElement('th');
                    th.textContent = day;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Создаем тело таблицы
                for (let y = 0; y < 4; y++) {
                    const tr = document.createElement('tr');
                    for (let i = 1; i <= 7; i++) {
                        const currentDay = i + y * 7;
                        const isWithinRange = subtask.start_date <= currentDay && subtask.due_date >= currentDay;
                        const td = document.createElement('td');
                        td.textContent = currentDay;

                        if (isWithinRange) {
                            td.style.color = '#ffffff';
                            td.style.backgroundColor = 'rgb(183, 117, 241)';
                        }

                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                }
                table.appendChild(tbody);
                calendarContainer.appendChild(table);
            });
        } else {
            calendarContainer.innerHTML += '<p>No subtasks available.</p>';
        }
    }

});