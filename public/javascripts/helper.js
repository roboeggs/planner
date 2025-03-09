// Функция для определения цвета по сложности
function getColorByComplexity(complexity) {
    switch (complexity) {
        case 'Easy': return '#C2EEFF';
        case 'Medium': return '#0D99FF';
        case 'Hard': return '#9747FF';
        default: return '#FFFFFF';
    }
}