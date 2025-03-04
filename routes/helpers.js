module.exports.getColorByComplexity = function(complexity) {
    switch (complexity) {
      case 'Easy':
        return '#AFF4C6'; // Light green
      case 'Medium':
        return '#FCD19C'; // Light yellow
      case 'Hard':
        return '#f8d7da'; // Light red
      default:
        return '#ffffff'; // White
    }
  };
  