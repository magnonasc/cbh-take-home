# Refactoring

You've been asked to refactor the function `deterministicPartitionKey` in [`dpk.js`](dpk.js) to make it easier to read and understand without changing its functionality. For this task, you should:

1. Write unit tests to cover the existing functionality and ensure that your refactor doesn't break it. We typically use `jest`, but if you have another library you prefer, feel free to use it.
2. Refactor the function to be as "clean" and "readable" as possible. There are many valid ways to define those words - use your own personal definitions, but be prepared to defend them. Note that we do like to use the latest JS language features when applicable.
3. Write up a brief (~1 paragraph) explanation of why you made the choices you did and why specifically your version is more "readable" than the original.

You will be graded on the exhaustiveness and quality of your unit tests, the depth of your refactor, and the level of insight into your thought process provided by the written explanation.

## Your Explanation Here

First I extract the constants `TRIVIAL_PARTITION_KEY` and `MAX_PARTITION_KEY_LENGTH` out of the method, since they never change, there's no need to initialize them everytime the `deterministicPartitionKey` function is executed. Then I extracted the logic to create hash into a separate method, in order to avoid duplicated code and improve reusability. Then I identified all the pre-conditions that could be used to return a value earlier instead of proceeding with the execution (Analog to the "fail-fast" programming concept). And in the end, everything we have left is the treatment over the `partitionKey` value, which I didn't change because there was no such constraint in this assignment like "`event.partitionKey` will always be a string".
