// General constants
const NUM_SCHOOLS = 10;
const NUM_PREFERENCE_ENTRIES = 5;
const NUM_STUDENTS = 1000;
const AVG_NUM_STUDENTS_PER_SCHOOL = 120;
const MAX_NUM_STUDENT_DEVIATION = 20;

// Ant Colony Optimization constants
const NUM_RUNS_PER_GENERATION = 5;
const NUM_GENERATIONS = 10;
const ALPHA = 0.5;
const BETA = 2;
const INITIAL_PHEROMONE_LEVEL = 0.5;
const PHEROMONE_DECAY_FACTOR = 0.7;
const PHEROMONE_STRENGTHENING_ADDITION = 2;

// Number of students every school can host
const schoolCapacities = [];
// List of preferences for every student
const studentPreferences = [];
// Pheromone-level for each match
const pheromones = {};
// Scores per generation (showing progress over iteration)
const generationScores = [];

function main() {
    generateSetup();
    const antScore = calculateAntMatchScore();
    const randomScore = calculateRandomMatchScore();
    postMessage({
        antScore: antScore,
        randomScore: randomScore,
        generationScores: generationScores
    });
}

function generateSetup() {
    generateSchoolCapacities();
    generateStudentPreferences();
    generatePheromones();
}

function generateSchoolCapacities() {
    schoolCapacities.length = 0;
    for (var i = 0; i < NUM_SCHOOLS; i++) {
        schoolCapacities.push(AVG_NUM_STUDENTS_PER_SCHOOL - MAX_NUM_STUDENT_DEVIATION
            + Math.floor(2 * MAX_NUM_STUDENT_DEVIATION * Math.random()));
    }
}

function generateStudentPreferences() {
    studentPreferences.length = 0;
    for (var i = 0; i < NUM_STUDENTS; i++) {
        const prefList = Array.from(new Array(NUM_SCHOOLS), function (x, i) {return i;});
        shufflePreferenceList(prefList);
        studentPreferences.push(prefList.slice(0, NUM_PREFERENCE_ENTRIES));
    }
}

function shufflePreferenceList(array) {
    for (var i = 0; i < array.length; i++) {
        // Most preferences go to one of top three schools
        if (Math.random() < 0.5 && i < 3) {
            continue;
        }
        var j = 3 + Math.floor(Math.random() * (i - 2));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function generatePheromones() {
    for (var student = 0; student < NUM_STUDENTS; student++) {
        for (var school = 0; school < NUM_SCHOOLS; school++) {
            pheromones[[student, school]] = INITIAL_PHEROMONE_LEVEL;
        }
    }
}

function calculateAntMatchScore() {
    generationScores.length = 0;

    var bestRun;
    for (var generation = 0; generation < NUM_GENERATIONS; generation++) {
        const runs = [];
        for (var i = 0; i < NUM_RUNS_PER_GENERATION; i++) {
            runs.push([]);
            const numStudentsPerSchool = Array.from(new Array(NUM_SCHOOLS), function () {return 0;});
            for (var student = 0; student < NUM_STUDENTS; student++) {
                runs[i].push(matchStudentToSchool(student, numStudentsPerSchool));
            }
        }

        const bestRunIndex = getBestRun(runs);
        bestRun = runs[bestRunIndex];
        generationScores.push(computeSolutionScore(bestRun));

        decayPheromones();
        strengthenPheromones(bestRun);
    }

    return computeSolutionScore(bestRun);
}

function matchStudentToSchool(student, numStudentsPerSchool) {
    var combinedDenominator = 0;
    for (var school = 0; school < NUM_SCHOOLS; school++) {
        combinedDenominator += calculateProbComponent(student, school, numStudentsPerSchool);
    }

    const schoolProbabilities = [];
    for (school = 0; school < NUM_SCHOOLS; school++) {
        const prob = calculateProbComponent(student, school, numStudentsPerSchool) / combinedDenominator;
        schoolProbabilities.push(prob);
    }
    const pickedSchool = pickRandomWeightedIndex(schoolProbabilities);
    numStudentsPerSchool[pickedSchool]++;
    return pickedSchool;
}

function calculateProbComponent(student, school, numStudentsPerSchool) {
    if (numStudentsPerSchool[school] >= schoolCapacities[school]) {
        return 0;
    } else {
        return Math.pow(pheromones[[student, school]], ALPHA)
            * Math.pow(NUM_PREFERENCE_ENTRIES - computeMatchScore(student, school), BETA);
    }
}

function pickRandomWeightedIndex(probabilities) {
    const randomNumber = Math.random();

    var probSum = 0;
    for (var i = 0; i < probabilities.length; i++) {
        probSum += probabilities[i];
        if (randomNumber <= probSum) {
            return i;
        }
    }
    return -1;
}

function getBestRun(runs) {
    const scores = runs.map(computeSolutionScore);
    return indexOfMinScore(scores);
}

function decayPheromones() {
    for (var match in pheromones) {
        pheromones[match] *= PHEROMONE_DECAY_FACTOR;
    }
}

function strengthenPheromones(schoolsPerStudent) {
    for (var student = 0; student < schoolsPerStudent.length; student++) {
        pheromones[[student, schoolsPerStudent[student]]] += PHEROMONE_STRENGTHENING_ADDITION;
    }
}

function calculateRandomMatchScore() {
    const schoolsPerStudent = [];
    for (var i = 0; i < NUM_STUDENTS; i++) {
        schoolsPerStudent.push(Math.floor(Math.random() * NUM_SCHOOLS))
    }

    return computeSolutionScore(schoolsPerStudent);
}

function computeSolutionScore(schoolsPerStudent) {
    var score = 0;

    for (var i = 0; i < NUM_STUDENTS; i++) {
        score += computeMatchScore(i, schoolsPerStudent[i]);
    }

    return score;
}

function computeMatchScore(student, school) {
    const preferenceIndex = studentPreferences[student].indexOf(school);
    if (preferenceIndex === -1) {
        return NUM_PREFERENCE_ENTRIES;
    } else {
        return preferenceIndex;
    }
}

function indexOfMinScore(scores) {
    if (scores.length === 0) {
        return -1;
    }

    var min = scores[0];
    var minIndex = 0;
    for (var i = 1; i < scores.length; i++) {
        if (scores[i] < min) {
            min = scores[i];
            minIndex = i;
        }
    }

    return minIndex;
}

main();
