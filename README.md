# ant-schools
A proof of concept for using Ant Colony Optimization to match students to schools

This is an experimental showcase of the power of ACO algorithms as technique for solving real-life problems. In this case, a match between students and schools needs to be made by a central authority. Each student can submit a list of preferences, which are taken into account as long as the schools don't exceed their capacity. Because of this constraint, matchings can be of varying quality, and this application compares a simple ACO implementation to a random match. For the detailed experimental setup and execution, see the `aco-worker.js` file.

This experimental implementation was developed in the context of the Collective Intelligence course at the VU Amsterdam.
