import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { ExternalLink, ChevronDown, ChevronRight, Search } from "lucide-react";

const SHEET_DATA = {
  title: "DSA Sheet by Love Babbar",
  total_topics: 15,
  total_problems: 445,
  topics: [
    {
      topic: "Arrays",
      count: 36,
      problems: [
        { id: "arrays-1", title: "Reverse an Array/String", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-string/1" },
        { id: "arrays-2", title: "Find the maximum and minimum element in an array", gfg_link: "https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1" },
        { id: "arrays-3", title: "Find the \"Kth\" max and min element of an array", gfg_link: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
        { id: "arrays-4", title: "Given an array which consists of only 0, 1 and 2. Sort the array without using any sorting algo", gfg_link: "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1" },
        { id: "arrays-5", title: "Move all the negative elements to one side of the array", gfg_link: "https://www.geeksforgeeks.org/problems/move-all-negative-elements-to-end1813/1" },
        { id: "arrays-6", title: "Find the Union and Intersection of the two sorted arrays.", gfg_link: "https://www.geeksforgeeks.org/problems/union-of-two-arrays3538/1" },
        { id: "arrays-7", title: "Write a program to cyclically rotate an array by one.", gfg_link: "https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1" },
        { id: "arrays-8", title: "Find Largest sum contiguous Subarray [V. IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1" },
        { id: "arrays-9", title: "Minimize the maximum difference between heights [V.IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/minimize-the-heights3351/1" },
        { id: "arrays-10", title: "Minimum no. of Jumps to reach end of an array", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
        { id: "arrays-11", title: "Find duplicate in an array of N+1 Integers", gfg_link: "https://www.geeksforgeeks.org/problems/find-duplicates-in-an-array/1" },
        { id: "arrays-12", title: "Merge 2 sorted arrays without using Extra space.", gfg_link: "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1" },
        { id: "arrays-13", title: "Kadane's Algo [V.V.V.V.V IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1" },
        { id: "arrays-14", title: "Merge Intervals", gfg_link: "https://www.geeksforgeeks.org/problems/overlapping-intervals--170633/1" },
        { id: "arrays-15", title: "Next Permutation", gfg_link: "https://www.geeksforgeeks.org/problems/next-permutation5226/1" },
        { id: "arrays-16", title: "Count Inversion", gfg_link: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
        { id: "arrays-17", title: "Best time to buy and Sell stock", gfg_link: "https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1" },
        { id: "arrays-18", title: "Find all pairs on integer array whose sum is equal to given number", gfg_link: "https://www.geeksforgeeks.org/problems/count-pairs-with-given-sum5022/1" },
        { id: "arrays-19", title: "Find common elements In 3 sorted arrays", gfg_link: "https://www.geeksforgeeks.org/problems/common-elements1132/1" },
        { id: "arrays-20", title: "Rearrange the array in alternating positive and negative items with O(1) extra space", gfg_link: "https://www.geeksforgeeks.org/problems/-rearrange-array-alternately-1587115620/1" },
        { id: "arrays-21", title: "Find if there is any subarray with sum equal to 0", gfg_link: "https://www.geeksforgeeks.org/problems/subarray-with-0-sum-1587115621/1" },
        { id: "arrays-22", title: "Find factorial of a large number", gfg_link: "https://www.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1" },
        { id: "arrays-23", title: "Find maximum product subarray", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-product-subarray3604/1" },
        { id: "arrays-24", title: "Find longest consecutive subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2449/1" },
        { id: "arrays-25", title: "Given an array of size n and a number k, find all elements that appear more than \"n/k\" times.", gfg_link: "https://www.geeksforgeeks.org/problems/count-element-occurences/1" },
        { id: "arrays-26", title: "Maximum profit by buying and selling a share at most twice", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-profit4657/1" },
        { id: "arrays-27", title: "Find whether an array is a subset of another array", gfg_link: "https://www.geeksforgeeks.org/problems/array-subset-of-another-array2317/1" },
        { id: "arrays-28", title: "Find the triplet that sum to a given value", gfg_link: "https://www.geeksforgeeks.org/problems/triplet-sum-in-array-1587115621/1" },
        { id: "arrays-29", title: "Trapping Rain water problem", gfg_link: "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1" },
        { id: "arrays-30", title: "Chocolate Distribution problem", gfg_link: "https://www.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
        { id: "arrays-31", title: "Smallest Subarray with sum greater than a given value", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-subarray-with-sum-greater-than-x5651/1" },
        { id: "arrays-32", title: "Three way partitioning of an array around a given value", gfg_link: "https://www.geeksforgeeks.org/problems/three-way-partitioning/1" },
        { id: "arrays-33", title: "Minimum swaps required bring elements less equal K together", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-swaps-required-to-bring-all-elements-less-than-or-equal-to-k-together4847/1" },
        { id: "arrays-34", title: "Minimum no. of operations required to make an array palindrome", gfg_link: "https://www.geeksforgeeks.org/problems/palindromic-array-1587115620/1" },
        { id: "arrays-35", title: "Median of 2 sorted arrays of equal size", gfg_link: "https://www.geeksforgeeks.org/problems/find-the-median0527/1" },
        { id: "arrays-36", title: "Median of 2 sorted arrays of different size", gfg_link: "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1" },
      ],
    },
    {
      topic: "Matrix",
      count: 10,
      problems: [
        { id: "matrix-1", title: "Spiral traversal on a Matrix", gfg_link: "https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix-1587115621/1" },
        { id: "matrix-2", title: "Search an element in a Matrix", gfg_link: "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1" },
        { id: "matrix-3", title: "Find median in a row wise sorted matrix", gfg_link: "https://www.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1" },
        { id: "matrix-4", title: "Find row with maximum no. of 1's", gfg_link: "https://www.geeksforgeeks.org/problems/row-with-max-1s0023/1" },
        { id: "matrix-5", title: "Print elements in sorted order using row-column wise sorted matrix", gfg_link: "https://www.geeksforgeeks.org/problems/sorted-matrix2333/1" },
        { id: "matrix-6", title: "Maximum size rectangle", gfg_link: "https://www.geeksforgeeks.org/problems/max-rectangle/1" },
        { id: "matrix-7", title: "Find a specific pair in matrix", gfg_link: "https://www.geeksforgeeks.org/dsa/find-a-specific-pair-in-matrix/" },
        { id: "matrix-8", title: "Rotate matrix by 90 degrees", gfg_link: "https://www.geeksforgeeks.org/problems/rotate-by-90-degree0356/1" },
        { id: "matrix-9", title: "Kth smallest element in a row-column wise sorted matrix", gfg_link: "https://www.geeksforgeeks.org/problems/kth-element-in-matrix/1" },
        { id: "matrix-10", title: "Common elements in all rows of a given matrix", gfg_link: "https://www.geeksforgeeks.org/problems/common-elements1132/1" },
      ],
    },
    {
      topic: "Strings",
      count: 43,
      problems: [
        { id: "strings-1", title: "Reverse a String", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-string/1" },
        { id: "strings-2", title: "Check whether a String is Palindrome or not", gfg_link: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1" },
        { id: "strings-3", title: "Find Duplicate characters in a string", gfg_link: "https://www.geeksforgeeks.org/dsa/print-all-the-duplicates-in-the-input-string/" },
        { id: "strings-4", title: "Why strings are immutable in Java?", gfg_link: "https://www.geeksforgeeks.org/java/java-string-is-immutable-what-exactly-is-the-meaning/" },
        { id: "strings-5", title: "Write a Code to check whether one string is a rotation of another", gfg_link: "https://www.geeksforgeeks.org/problems/check-if-strings-are-rotations-of-each-other-or-not-1587115620/1" },
        { id: "strings-6", title: "Write a Program to check whether a string is a valid shuffle of two strings or not", gfg_link: "https://www.geeksforgeeks.org/dsa/check-if-the-given-string-is-shuffled-substring-of-another-string/" },
        { id: "strings-7", title: "Count and Say problem", gfg_link: "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1" },
        { id: "strings-8", title: "Write a program to find the longest Palindrome in a string.", gfg_link: "https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string3411/1" },
        { id: "strings-9", title: "Find Longest Recurring Subsequence in String", gfg_link: "https://www.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1" },
        { id: "strings-10", title: "Print all Subsequences of a string.", gfg_link: "https://www.geeksforgeeks.org/problems/power-set4302/1" },
        { id: "strings-11", title: "Print all the permutations of the given string", gfg_link: "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1" },
        { id: "strings-12", title: "Split the Binary string into two substring with equal 0's and 1's", gfg_link: "https://www.geeksforgeeks.org/problems/split-the-binary-string-into-substrings-with-equal-number-of-0s-and-1s/1" },
        { id: "strings-13", title: "Word Wrap Problem [VERY IMP].", gfg_link: "https://www.geeksforgeeks.org/problems/word-wrap1646/1" },
        { id: "strings-14", title: "EDIT Distance [Very Imp]", gfg_link: "https://www.geeksforgeeks.org/problems/edit-distance3702/1" },
        { id: "strings-15", title: "Find next greater number with same set of digits. [Very Very IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/next-permutation5226/1" },
        { id: "strings-16", title: "Balanced Parenthesis problem.[Imp]", gfg_link: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1" },
        { id: "strings-17", title: "Word break Problem[ Very Imp]", gfg_link: "https://www.geeksforgeeks.org/problems/word-break1352/1" },
        { id: "strings-18", title: "Rabin Karp Algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/search-pattern-rabin-karp-algorithm--141631/1" },
        { id: "strings-19", title: "KMP Algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/longest-prefix-suffix2527/1" },
        { id: "strings-20", title: "Convert a Sentence into its equivalent mobile numeric keypad sequence.", gfg_link: "https://www.geeksforgeeks.org/problems/convert-a-sentence-into-its-equivalent-mobile-numeric-keypad-sequence0547/1" },
        { id: "strings-21", title: "Minimum number of bracket reversals needed to make an expression balanced.", gfg_link: "https://www.geeksforgeeks.org/problems/count-the-reversals0401/1" },
        { id: "strings-22", title: "Count All Palindromic Subsequence in a given String.", gfg_link: "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
        { id: "strings-23", title: "Count of number of given string in 2D character array", gfg_link: "https://www.geeksforgeeks.org/problems/count-occurences-of-a-given-word-in-a-2-d-array/1" },
        { id: "strings-24", title: "Search a Word in a 2D Grid of characters.", gfg_link: "https://www.geeksforgeeks.org/problems/find-the-string-in-grid0111/1" },
        { id: "strings-25", title: "Boyer Moore Algorithm for Pattern Searching.", gfg_link: "https://www.geeksforgeeks.org/problems/pattern-searching5231/1" },
        { id: "strings-26", title: "Converting Roman Numerals to Decimal", gfg_link: "https://www.geeksforgeeks.org/problems/roman-number-to-integer3201/1" },
        { id: "strings-27", title: "Longest Common Prefix", gfg_link: "https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1" },
        { id: "strings-28", title: "Number of flips to make binary string alternate", gfg_link: "https://www.geeksforgeeks.org/problems/min-number-of-flips3210/1" },
        { id: "strings-29", title: "Find the first repeated word in string.", gfg_link: "https://www.geeksforgeeks.org/problems/find-first-repeated-character4108/1" },
        { id: "strings-30", title: "Minimum number of swaps for bracket balancing.", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-swaps-for-bracket-balancing2704/1" },
        { id: "strings-31", title: "Find the longest common subsequence between two strings.", gfg_link: "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1" },
        { id: "strings-32", title: "Program to generate all possible valid IP addresses from given string.", gfg_link: "https://www.geeksforgeeks.org/problems/generate-ip-addresses/1" },
        { id: "strings-33", title: "Write a program to find the smallest window that contains all characters of string itself.", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-distant-window3132/1" },
        { id: "strings-34", title: "Rearrange characters in a string such that no two adjacent are same", gfg_link: "https://www.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: "strings-35", title: "Minimum characters to be added at front to make string palindrome", gfg_link: "https://www.geeksforgeeks.org/problems/form-a-palindrome1455/1" },
        { id: "strings-36", title: "Given a sequence of words, print all anagrams together", gfg_link: "https://www.geeksforgeeks.org/problems/print-anagrams-together/1" },
        { id: "strings-37", title: "Find the smallest window in a string containing all characters of another string", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1" },
        { id: "strings-38", title: "Recursively remove all adjacent duplicates", gfg_link: "https://www.geeksforgeeks.org/problems/consecutive-elements2306/1" },
        { id: "strings-39", title: "String matching where one string contains wildcard characters", gfg_link: "https://www.geeksforgeeks.org/problems/wildcard-string-matching1126/1" },
        { id: "strings-40", title: "Function to find Number of customers who could not get a computer", gfg_link: "https://www.geeksforgeeks.org/problems/unoccupied-computers-1646661078/1" },
        { id: "strings-41", title: "Transform One String to Another using Minimum Number of Given Operation", gfg_link: "https://www.geeksforgeeks.org/problems/transform-string5648/1" },
        { id: "strings-42", title: "Check if two given strings are isomorphic to each other", gfg_link: "https://www.geeksforgeeks.org/problems/isomorphic-strings-1587115620/1" },
        { id: "strings-43", title: "Recursively print all sentences that can be formed from list of word lists", gfg_link: "https://www.geeksforgeeks.org/problems/recursively-print-all-sentences-that-can-be-formed-from-list-of-word-lists/1" },
      ],
    },
    {
      topic: "Searching and Sorting",
      count: 35,
      problems: [
        { id: "sort-1", title: "Find first and last positions of an element in a sorted array", gfg_link: "https://www.geeksforgeeks.org/problems/first-and-last-occurrences-of-x3116/1" },
        { id: "sort-2", title: "Find a Fixed Point (Value equal to index) in a given array", gfg_link: "https://www.geeksforgeeks.org/problems/value-equal-to-index-value1330/1" },
        { id: "sort-3", title: "Search in a rotated sorted array", gfg_link: "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array0959/1" },
        { id: "sort-4", title: "Square root of an integer", gfg_link: "https://www.geeksforgeeks.org/problems/count-squares3649/1" },
        { id: "sort-5", title: "Maximum and minimum of an array using minimum number of comparisons", gfg_link: "https://www.geeksforgeeks.org/problems/middle-of-three2926/1" },
        { id: "sort-6", title: "Optimum location of point to minimize total distance", gfg_link: "https://www.geeksforgeeks.org/problems/optimum-location-of-point-to-minimize-total-distance/0" },
        { id: "sort-7", title: "Find the repeating and the missing", gfg_link: "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1" },
        { id: "sort-8", title: "Find majority element", gfg_link: "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1" },
        { id: "sort-9", title: "Searching in an array where adjacent differ by at most k", gfg_link: "https://www.geeksforgeeks.org/problems/searching-in-an-array-where-adjacent-differ-by-at-most-k0456/1" },
        { id: "sort-10", title: "Find a pair with a given difference", gfg_link: "https://www.geeksforgeeks.org/problems/find-pair-given-difference1559/1" },
        { id: "sort-11", title: "Find four elements that sum to a given value", gfg_link: "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1" },
        { id: "sort-12", title: "Maximum sum such that no 2 elements are adjacent", gfg_link: "https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1" },
        { id: "sort-13", title: "Count triplet with sum smaller than a given value", gfg_link: "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1" },
        { id: "sort-14", title: "Merge 2 sorted arrays", gfg_link: "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1" },
        { id: "sort-15", title: "Product array Puzzle", gfg_link: "https://www.geeksforgeeks.org/problems/product-array-puzzle4525/1" },
        { id: "sort-16", title: "Sort array according to count of set bits", gfg_link: "https://www.geeksforgeeks.org/problems/sort-by-set-bit-count1153/1" },
        { id: "sort-17", title: "Minimum no. of swaps required to sort the array", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-swaps/1" },
        { id: "sort-18", title: "Bishu and Soldiers" },
        { id: "sort-19", title: "Rasta and Kheshtak", secondary_link: "https://www.hackerearth.com/practice/algorithms/searching/binary-search/practice-problems/algorithm/rasta-and-kheshtak/" },
        { id: "sort-20", title: "Kth smallest number again", gfg_link: "https://www.geeksforgeeks.org/problems/find-k-th-smallest-element-in-given-n-ranges/1" },
        { id: "sort-21", title: "Find pivot element in a sorted array", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array3611/1" },
        { id: "sort-22", title: "K-th Element of Two Sorted Arrays", gfg_link: "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1" },
        { id: "sort-23", title: "Aggressive cows", gfg_link: "https://www.geeksforgeeks.org/problems/aggressive-cows/1" },
        { id: "sort-24", title: "Book Allocation Problem", gfg_link: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1" },
        { id: "sort-25", title: "EKOSPOJ", secondary_link: "https://www.spoj.com/problems/EKO/" },
        { id: "sort-26", title: "Job Scheduling Algo", gfg_link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
        { id: "sort-27", title: "Missing Number in AP", gfg_link: "https://www.geeksforgeeks.org/problems/arithmetic-number2815/1" },
        { id: "sort-28", title: "Smallest number with atleast n trailing zeroes in factorial", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-factorial-number5929/1" },
        { id: "sort-29", title: "Painters Partition Problem", gfg_link: "https://www.geeksforgeeks.org/problems/the-painters-partition-problem1535/1" },
        { id: "sort-30", title: "ROTI-Prata SPOJ", secondary_link: "https://www.spoj.com/problems/PRATA/" },
        { id: "sort-31", title: "DoubleHelix SPOJ", secondary_link: "https://www.spoj.com/problems/ANARC05B/" },
        { id: "sort-32", title: "Subset Sums", gfg_link: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
        { id: "sort-33", title: "Find the inversion count", gfg_link: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
        { id: "sort-34", title: "Implement Merge-sort in-place", gfg_link: "https://www.geeksforgeeks.org/dsa/in-place-merge-sort/" },
        { id: "sort-35", title: "Partitioning and Sorting Arrays with Many Repeated Entries" },
      ],
    },
    {
      topic: "LinkedList",
      count: 35,
      problems: [
        { id: "ll-1", title: "Write a Program to reverse the Linked List. (Both Iterative and recursive)", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1" },
        { id: "ll-2", title: "Reverse a Linked List in group of Given Size. [Very Imp]", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1" },
        { id: "ll-3", title: "Write a program to Detect loop in a linked list.", gfg_link: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1" },
        { id: "ll-4", title: "Write a program to Delete loop in a linked list.", gfg_link: "https://www.geeksforgeeks.org/problems/remove-loop-in-linked-list/1" },
        { id: "ll-5", title: "Find the starting point of the loop.", gfg_link: "https://www.geeksforgeeks.org/problems/find-the-first-node-of-loop-in-linked-list--170645/1" },
        { id: "ll-6", title: "Remove Duplicates in a sorted Linked List.", gfg_link: "https://www.geeksforgeeks.org/problems/remove-duplicate-element-from-sorted-linked-list/1" },
        { id: "ll-7", title: "Remove Duplicates in a Un-sorted Linked List.", gfg_link: "https://www.geeksforgeeks.org/problems/remove-duplicates-from-an-unsorted-linked-list/1" },
        { id: "ll-8", title: "Write a Program to Move the last element to Front in a Linked List.", gfg_link: "https://www.geeksforgeeks.org/dsa/move-last-element-to-front-of-a-given-linked-list/" },
        { id: "ll-9", title: "Add \"1\" to a number represented as a Linked List.", gfg_link: "https://www.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1" },
        { id: "ll-10", title: "Add two numbers represented by linked lists.", gfg_link: "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1" },
        { id: "ll-11", title: "Intersection of two Sorted Linked List.", gfg_link: "https://www.geeksforgeeks.org/problems/intersection-of-two-sorted-linked-lists/1" },
        { id: "ll-12", title: "Intersection Point of two Linked Lists.", gfg_link: "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1" },
        { id: "ll-13", title: "Merge Sort For Linked lists.[Very Important]", gfg_link: "https://www.geeksforgeeks.org/problems/sort-a-linked-list/1" },
        { id: "ll-14", title: "Quicksort for Linked Lists.[Very Important]", gfg_link: "https://www.geeksforgeeks.org/problems/quick-sort-on-linked-list/1" },
        { id: "ll-15", title: "Find the middle Element of a linked list.", gfg_link: "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1" },
        { id: "ll-16", title: "Check if a linked list is a circular linked list.", gfg_link: "https://www.geeksforgeeks.org/problems/circular-linked-list/1" },
        { id: "ll-17", title: "Split a Circular linked list into two halves.", gfg_link: "https://www.geeksforgeeks.org/problems/split-a-circular-linked-list-into-two-halves/1" },
        { id: "ll-18", title: "Write a Program to check whether the Singly Linked list is a palindrome or not.", gfg_link: "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1" },
        { id: "ll-19", title: "Deletion from a Circular Linked List.", gfg_link: "https://www.geeksforgeeks.org/problems/deletion-and-reverse-in-linked-list/1" },
        { id: "ll-20", title: "Reverse a Doubly Linked list.", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1" },
        { id: "ll-21", title: "Find pairs with a given sum in a DLL.", gfg_link: "https://www.geeksforgeeks.org/problems/find-pairs-with-given-sum-in-doubly-linked-list/1" },
        { id: "ll-22", title: "Count triplets in a sorted DLL whose sum is equal to given value \"X\".", gfg_link: "https://www.geeksforgeeks.org/dsa/count-triplets-sorted-doubly-linked-list-whose-sum-equal-given-value-x/" },
        { id: "ll-23", title: "Sort a \"k\" sorted Doubly Linked list.[Very IMP]", gfg_link: "https://www.geeksforgeeks.org/dsa/sort-k-sorted-doubly-linked-list/" },
        { id: "ll-24", title: "Rotate Doubly Linked list by N nodes.", gfg_link: "https://www.geeksforgeeks.org/dsa/rotate-doubly-linked-list-n-nodes/" },
        { id: "ll-25", title: "Rotate a Doubly Linked list in group of Given Size.[Very IMP]", gfg_link: "https://www.geeksforgeeks.org/dsa/reverse-doubly-linked-list-groups-given-size/" },
        { id: "ll-26", title: "Can we reverse a linked list in less than O(n)?", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1" },
        { id: "ll-27", title: "Why Quicksort is preferred for Arrays and Merge Sort for Linked Lists?" },
        { id: "ll-28", title: "Flatten a Linked List", gfg_link: "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1" },
        { id: "ll-29", title: "Sort a LL of 0's, 1's and 2's", gfg_link: "https://www.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1" },
        { id: "ll-30", title: "Clone a linked list with next and random pointer", gfg_link: "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1" },
        { id: "ll-31", title: "Merge K sorted Linked list", gfg_link: "https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1" },
        { id: "ll-32", title: "Multiply 2 no. represented by LL", gfg_link: "https://www.geeksforgeeks.org/problems/multiply-two-linked-lists/1" },
        { id: "ll-33", title: "Delete nodes which have a greater value on right side", gfg_link: "https://www.geeksforgeeks.org/problems/delete-nodes-having-greater-value-on-right/1" },
        { id: "ll-34", title: "Segregate even and odd nodes in a Linked List", gfg_link: "https://www.geeksforgeeks.org/problems/segregate-even-and-odd-nodes-in-a-linked-list5035/1" },
        { id: "ll-35", title: "Program for n'th node from the end of a Linked List", gfg_link: "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1" },
      ],
    },
    {
      topic: "Bit Manipulation",
      count: 10,
      problems: [
        { id: "bit-1", title: "Count set bits in an integer", gfg_link: "https://www.geeksforgeeks.org/problems/set-bits0143/1" },
        { id: "bit-2", title: "Find the two non-repeating elements in an array of repeating elements", gfg_link: "https://www.geeksforgeeks.org/problems/finding-the-numbers0215/1" },
        { id: "bit-3", title: "Count number of bits to be flipped to convert A to B", gfg_link: "https://www.geeksforgeeks.org/problems/bit-difference-1587115620/1" },
        { id: "bit-4", title: "Count total set bits in all numbers from 1 to n", gfg_link: "https://www.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1" },
        { id: "bit-5", title: "Program to find whether a no is power of two", gfg_link: "https://www.geeksforgeeks.org/problems/power-of-2-1587115620/1" },
        { id: "bit-6", title: "Find position of the only set bit", gfg_link: "https://www.geeksforgeeks.org/problems/find-position-of-set-bit3706/1" },
        { id: "bit-7", title: "Copy set bits in a range", gfg_link: "https://www.geeksforgeeks.org/problems/set-all-the-bits-in-given-range-of-a-number4538/1" },
        { id: "bit-8", title: "Divide two integers without using multiplication, division and mod operator", gfg_link: "https://www.geeksforgeeks.org/problems/division-without-using-multiplication-division-and-mod-operator/0" },
        { id: "bit-9", title: "Calculate square of a number without using *, / and pow()", gfg_link: "https://www.geeksforgeeks.org/problems/square-root/1" },
        { id: "bit-10", title: "Power Set", gfg_link: "https://www.geeksforgeeks.org/problems/power-set4302/1" },
      ],
    },
    {
      topic: "Greedy",
      count: 35,
      problems: [
        { id: "greedy-1", title: "Activity Selection Problem", gfg_link: "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
        { id: "greedy-2", title: "Job Sequencing Problem", gfg_link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
        { id: "greedy-3", title: "Huffman Coding", gfg_link: "https://www.geeksforgeeks.org/problems/huffman-encoding3345/1" },
        { id: "greedy-4", title: "Water Connection Problem", gfg_link: "https://www.geeksforgeeks.org/problems/water-connection-problem5822/1" },
        { id: "greedy-5", title: "Fractional Knapsack Problem", gfg_link: "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1" },
        { id: "greedy-6", title: "Greedy Algorithm to find Minimum number of Coins", gfg_link: "https://www.geeksforgeeks.org/problems/choose-and-swap0531/1" },
        { id: "greedy-7", title: "Maximum trains for which stoppage can be provided", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-trains-for-which-stoppage-can-be-provided/1" },
        { id: "greedy-8", title: "Minimum Platforms Problem", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1" },
        { id: "greedy-9", title: "Buy Maximum Stocks if i stocks can be bought on i-th day", gfg_link: "https://www.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1" },
        { id: "greedy-10", title: "Find the minimum and maximum amount to buy all N candies", gfg_link: "https://www.geeksforgeeks.org/problems/shop-in-candy-store1145/1" },
        { id: "greedy-11", title: "Minimize Cash Flow among a given set of friends who have borrowed money from each other", gfg_link: "https://www.geeksforgeeks.org/problems/minimize-cash-flow/1" },
        { id: "greedy-12", title: "Minimum Cost to cut a board into squares", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-cost-to-cut-a-board-into-squares/1" },
        { id: "greedy-13", title: "Check if it is possible to survive on Island", gfg_link: "https://www.geeksforgeeks.org/problems/check-if-it-is-possible-to-survive-on-island4922/1" },
        { id: "greedy-14", title: "Find maximum meetings in one room", gfg_link: "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
        { id: "greedy-15", title: "Maximum product subset of an array", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-product-subset-of-an-array/1" },
        { id: "greedy-16", title: "Maximize array sum after K negations", gfg_link: "https://www.geeksforgeeks.org/problems/maximize-sum-after-k-negations1149/1" },
        { id: "greedy-17", title: "Maximize the sum of arr[i]*i", gfg_link: "https://www.geeksforgeeks.org/problems/maximize-arrii-of-an-array0026/1" },
        { id: "greedy-18", title: "Maximum sum of absolute difference of an array", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-product-subset-of-an-array/1" },
        { id: "greedy-19", title: "Maximize sum of consecutive differences in a circular array", gfg_link: "https://www.geeksforgeeks.org/problems/swap-and-maximize5859/1" },
        { id: "greedy-20", title: "Minimum sum of absolute difference of pairs of two arrays", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-sum-of-absolute-differences-of-pairs/1" },
        { id: "greedy-21", title: "Program for Shortest Job First (SJF) CPU Scheduling", gfg_link: "https://www.geeksforgeeks.org/problems/calculate-the-average-waiting-time-and-turnaround-time-using-shortest-job-first/1" },
        { id: "greedy-22", title: "Program for Least Recently Used (LRU) Page Replacement algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/page-faults-in-lru5603/1" },
        { id: "greedy-23", title: "Smallest subset with sum greater than all other elements", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-subset-with-greater-sum/1" },
        { id: "greedy-24", title: "Chocolate Distribution Problem", gfg_link: "https://www.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
        { id: "greedy-25", title: "DEFKIN - Defense of a Kingdom", secondary_link: "https://www.spoj.com/problems/DEFKIN/" },
        { id: "greedy-26", title: "DIEHARD - DIE HARD", secondary_link: "https://www.spoj.com/problems/DIEHARD/" },
        { id: "greedy-27", title: "GERGOVIA - Wine trading in Gergovia", secondary_link: "https://www.spoj.com/problems/GERGOVIA/" },
        { id: "greedy-28", title: "Picking Up Chicks", secondary_link: "https://www.spoj.com/problems/GCJ101BB/" },
        { id: "greedy-29", title: "CHOCOLA – Chocolate", secondary_link: "https://www.spoj.com/problems/CHOCOLA/" },
        { id: "greedy-30", title: "ARRANGE - Arranging Amplifiers", secondary_link: "https://www.spoj.com/problems/ARRANGE/" },
        { id: "greedy-31", title: "K Centers Problem", gfg_link: "https://www.geeksforgeeks.org/problems/k-centers-problem/1" },
        { id: "greedy-32", title: "Minimum Cost of ropes", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
        { id: "greedy-33", title: "Find smallest number with given number of digits and sum of digits", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-number5829/1" },
        { id: "greedy-34", title: "Rearrange characters in a string such that no two adjacent are same", gfg_link: "https://www.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: "greedy-35", title: "Find maximum sum possible equal sum of three stacks", gfg_link: "https://www.geeksforgeeks.org/problems/find-maximum-equal-sum-of-three-stacks/1" },
      ],
    },
    {
      topic: "Backtracking",
      count: 19,
      problems: [
        { id: "bt-1", title: "Rat in a maze Problem", gfg_link: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
        { id: "bt-2", title: "Printing all solutions in N-Queen", gfg_link: "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1" },
        { id: "bt-3", title: "Word Break Problem using Backtracking", gfg_link: "https://www.geeksforgeeks.org/problems/word-break-part-23249/1" },
        { id: "bt-4", title: "Remove Invalid Parentheses", gfg_link: "https://www.geeksforgeeks.org/problems/remove-invalid-parentheses/1" },
        { id: "bt-5", title: "Sudoku Solver", gfg_link: "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1" },
        { id: "bt-6", title: "M Coloring Problem", gfg_link: "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
        { id: "bt-7", title: "Print all palindromic partitions of a string", gfg_link: "https://www.geeksforgeeks.org/problems/find-all-possible-palindromic-partitions-of-a-string/1" },
        { id: "bt-8", title: "Subset Sum Problem", gfg_link: "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1" },
        { id: "bt-9", title: "The Knight's tour problem", gfg_link: "https://www.geeksforgeeks.org/dsa/the-knights-tour-problem/" },
        { id: "bt-10", title: "Tug of War", gfg_link: "https://www.geeksforgeeks.org/dsa/tug-of-war/" },
        { id: "bt-11", title: "Find shortest safe route in a path with landmines", gfg_link: "https://www.geeksforgeeks.org/problems/find-shortest-safe-route-in-a-matrix/1" },
        { id: "bt-12", title: "Combinational Sum", gfg_link: "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1" },
        { id: "bt-13", title: "Find Maximum number possible by doing at-most K swaps", gfg_link: "https://www.geeksforgeeks.org/problems/largest-number-in-k-swaps-1587115620/1" },
        { id: "bt-14", title: "Print all permutations of a string", gfg_link: "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1" },
        { id: "bt-15", title: "Find if there is a path of more than k length from a source", gfg_link: "https://www.geeksforgeeks.org/problems/path-of-greater-than-equal-to-k-length1034/1" },
        { id: "bt-16", title: "Longest Possible Route in a Matrix with Hurdles", gfg_link: "https://www.geeksforgeeks.org/problems/longest-possible-route-in-a-matrix-with-hurdles/1" },
        { id: "bt-17", title: "Print all possible paths from top left to bottom right of a mXn matrix", gfg_link: "https://www.geeksforgeeks.org/problems/find-all-possible-paths-from-top-to-bottom/1" },
        { id: "bt-18", title: "Partition of a set into K subsets with equal sum", gfg_link: "https://www.geeksforgeeks.org/problems/partition-array-to-k-subsets/1" },
        { id: "bt-19", title: "Find the K-th Permutation Sequence of first N natural numbers", gfg_link: "https://www.geeksforgeeks.org/problems/find-kth-permutation-0932/0" },
      ],
    },
    {
      topic: "Dynamic Programming",
      count: 60,
      problems: [
        { id: "dp-1", title: "Coin Change Problem", gfg_link: "https://www.geeksforgeeks.org/problems/coin-change2448/1" },
        { id: "dp-2", title: "Knapsack Problem", gfg_link: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1" },
        { id: "dp-3", title: "Binomial Coefficient Problem", gfg_link: "https://www.geeksforgeeks.org/problems/ncr1019/1" },
        { id: "dp-4", title: "Permutation Coefficient Problem", gfg_link: "https://www.geeksforgeeks.org/dsa/permutation-coefficient/" },
        { id: "dp-5", title: "Program for nth Catalan Number", gfg_link: "https://www.geeksforgeeks.org/problems/nth-catalan-number0817/1" },
        { id: "dp-6", title: "Matrix Chain Multiplication", gfg_link: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1" },
        { id: "dp-7", title: "Edit Distance", gfg_link: "https://www.geeksforgeeks.org/problems/edit-distance3702/1" },
        { id: "dp-8", title: "Subset Sum Problem", gfg_link: "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1" },
        { id: "dp-9", title: "Friends Pairing Problem", gfg_link: "https://www.geeksforgeeks.org/problems/friends-pairing-problem5425/1" },
        { id: "dp-10", title: "Gold Mine Problem", gfg_link: "https://www.geeksforgeeks.org/problems/gold-mine-problem2608/1" },
        { id: "dp-11", title: "Assembly Line Scheduling Problem", gfg_link: "https://www.geeksforgeeks.org/problems/assembly-line-scheduling/1" },
        { id: "dp-12", title: "Painting the Fence problem", gfg_link: "https://www.geeksforgeeks.org/problems/painting-the-fence3727/1" },
        { id: "dp-13", title: "Maximize The Cut Segments", gfg_link: "https://www.geeksforgeeks.org/problems/cutted-segments1642/1" },
        { id: "dp-14", title: "Longest Common Subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1" },
        { id: "dp-15", title: "Longest Repeated Subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1" },
        { id: "dp-16", title: "Longest Increasing Subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1" },
        { id: "dp-17", title: "Space Optimized Solution of LCS", gfg_link: "https://www.geeksforgeeks.org/dsa/space-optimized-solution-lcs/" },
        { id: "dp-18", title: "LCS (Longest Common Subsequence) of three strings", gfg_link: "https://www.geeksforgeeks.org/problems/lcs-of-three-strings0028/1" },
        { id: "dp-19", title: "Maximum Sum Increasing Subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1" },
        { id: "dp-20", title: "Count all subsequences having product less than K", gfg_link: "https://www.geeksforgeeks.org/problems/count-the-subarrays-having-product-less-than-k1708/1" },
        { id: "dp-21", title: "Longest subsequence such that difference between adjacent is one", gfg_link: "https://www.geeksforgeeks.org/problems/longest-subsequence-such-that-difference-between-adjacents-is-one4724/1" },
        { id: "dp-22", title: "Maximum subsequence sum such that no three are consecutive", gfg_link: "https://www.geeksforgeeks.org/dsa/maximum-subsequence-sum-such-that-no-three-are-consecutive/" },
        { id: "dp-23", title: "Egg Dropping Problem", gfg_link: "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1" },
        { id: "dp-24", title: "Maximum Length Chain of Pairs", gfg_link: "https://www.geeksforgeeks.org/problems/max-length-chain/1" },
        { id: "dp-25", title: "Maximum size square sub-matrix with all 1s", gfg_link: "https://www.geeksforgeeks.org/problems/largest-square-formed-in-a-matrix0806/1" },
        { id: "dp-26", title: "Maximum sum of pairs with specific difference", gfg_link: "https://www.geeksforgeeks.org/problems/pairs-with-specific-difference1533/1" },
        { id: "dp-27", title: "Min Cost Path Problem", gfg_link: "https://www.geeksforgeeks.org/problems/path-in-matrix3805/1" },
        { id: "dp-28", title: "Maximum difference of zeros and ones in binary string", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-difference-of-zeros-and-ones-in-binary-string4111/1" },
        { id: "dp-29", title: "Minimum number of jumps to reach end", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
        { id: "dp-30", title: "Minimum cost to fill given weight in a bag", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-cost-to-fill-given-weight-in-a-bag1956/1" },
        { id: "dp-31", title: "Minimum removals from array to make max–min <= K", gfg_link: "https://www.geeksforgeeks.org/problems/array-removals/1" },
        { id: "dp-32", title: "Longest Common Substring", gfg_link: "https://www.geeksforgeeks.org/problems/longest-common-substring1452/1" },
        { id: "dp-33", title: "Count number of ways to reach a given score in a game", gfg_link: "https://www.geeksforgeeks.org/problems/reach-a-given-score-1587115621/1" },
        { id: "dp-34", title: "Count Balanced Binary Trees of Height h", gfg_link: "https://www.geeksforgeeks.org/problems/bbt-counter4914/1" },
        { id: "dp-35", title: "Largest Sum Contiguous Subarray [V>V>V>V IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1" },
        { id: "dp-36", title: "Smallest sum contiguous subarray", gfg_link: "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1" },
        { id: "dp-37", title: "Unbounded Knapsack (Repetition of items allowed)", gfg_link: "https://www.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1" },
        { id: "dp-38", title: "Word Break Problem", gfg_link: "https://www.geeksforgeeks.org/problems/word-break1352/1" },
        { id: "dp-39", title: "Largest Independent Set Problem", gfg_link: "https://www.geeksforgeeks.org/problems/largest-independent-set-problem/1" },
        { id: "dp-40", title: "Partition problem", gfg_link: "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1" },
        { id: "dp-41", title: "Longest Palindromic Subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-palindromic-subsequence-1612327878/1" },
        { id: "dp-42", title: "Count All Palindromic Subsequence in a given String", gfg_link: "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
        { id: "dp-43", title: "Longest Palindromic Substring", gfg_link: "https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string1956/1" },
        { id: "dp-44", title: "Longest alternating subsequence", gfg_link: "https://www.geeksforgeeks.org/problems/longest-alternating-subsequence5951/1" },
        { id: "dp-45", title: "Weighted Job Scheduling", gfg_link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
        { id: "dp-46", title: "Coin game winner where every player has three choices", gfg_link: "https://www.geeksforgeeks.org/dsa/coin-game-winner-every-player-three-choices/" },
        { id: "dp-47", title: "Count Derangements (Permutation such that no element appears in its original position)", gfg_link: "https://www.geeksforgeeks.org/dsa/count-derangements-permutation-such-that-no-element-appears-in-its-original-position/" },
        { id: "dp-48", title: "Maximum profit by buying and selling a share at most twice [IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-profit4657/1" },
        { id: "dp-49", title: "Optimal Strategy for a Game", gfg_link: "https://www.geeksforgeeks.org/problems/optimal-strategy-for-a-game-1587115620/1" },
        { id: "dp-50", title: "Optimal Binary Search Tree", gfg_link: "https://www.geeksforgeeks.org/problems/optimal-binary-search-tree2214/1" },
        { id: "dp-51", title: "Palindrome Partitioning Problem", gfg_link: "https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1" },
        { id: "dp-52", title: "Word Wrap Problem", gfg_link: "https://www.geeksforgeeks.org/problems/word-wrap1646/1" },
        { id: "dp-53", title: "Mobile Numeric Keypad Problem [IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/mobile-numeric-keypad5456/1" },
        { id: "dp-54", title: "Boolean Parenthesization Problem", gfg_link: "https://www.geeksforgeeks.org/problems/boolean-parenthesization5610/1" },
        { id: "dp-55", title: "Largest rectangular sub-matrix whose sum is 0", gfg_link: "https://www.geeksforgeeks.org/problems/largest-rectangular-sub-matrix-whose-sum-is-0/1" },
        { id: "dp-56", title: "Largest area rectangular sub-matrix with equal number of 1's and 0's [IMP]", gfg_link: "https://www.geeksforgeeks.org/dsa/largest-area-rectangular-sub-matrix-equal-number-1s-0s/" },
        { id: "dp-57", title: "Maximum sum rectangle in a 2D matrix", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-sum-rectangle2948/1" },
        { id: "dp-58", title: "Maximum profit by buying and selling a share at most k times", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-profit4657/1" },
        { id: "dp-59", title: "Find if a string is interleaved of two other strings", gfg_link: "https://www.geeksforgeeks.org/problems/interleaved-strings/1" },
        { id: "dp-60", title: "Maximum Length of Pair Chain", gfg_link: "https://www.geeksforgeeks.org/problems/max-length-chain/1" },
      ],
    },
    {
      topic: "Stacks and Queues",
      count: 38,
      problems: [
        { id: "sq-1", title: "Implement Stack from Scratch", gfg_link: "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1" },
        { id: "sq-2", title: "Implement Queue from Scratch", gfg_link: "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1" },
        { id: "sq-3", title: "Implement 2 stack in an array", gfg_link: "https://www.geeksforgeeks.org/problems/implement-two-stacks-in-an-array/1" },
        { id: "sq-4", title: "Find the middle element of a stack", gfg_link: "https://www.geeksforgeeks.org/dsa/design-a-stack-with-find-middle-operation/" },
        { id: "sq-5", title: "Implement \"N\" stacks in an Array", gfg_link: "https://www.geeksforgeeks.org/dsa/efficiently-implement-k-stacks-single-array/" },
        { id: "sq-6", title: "Check the expression has valid or Balanced parenthesis or not.", gfg_link: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1" },
        { id: "sq-7", title: "Reverse a String using Stack", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-string-using-stack/1" },
        { id: "sq-8", title: "Design a Stack that supports getMin() in O(1) time and O(1) extra space.", gfg_link: "https://www.geeksforgeeks.org/problems/special-stack/1" },
        { id: "sq-9", title: "Find the next Greater element", gfg_link: "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1" },
        { id: "sq-10", title: "The celebrity Problem", gfg_link: "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1" },
        { id: "sq-11", title: "Arithmetic Expression evaluation", gfg_link: "https://www.geeksforgeeks.org/dsa/arithmetic-expression-evalution/" },
        { id: "sq-12", title: "Evaluation of Postfix expression", gfg_link: "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1" },
        { id: "sq-13", title: "Implement a method to insert an element at its bottom without using any other data structure.", gfg_link: "https://www.geeksforgeeks.org/problems/insert-an-element-at-the-bottom-of-a-stack/1" },
        { id: "sq-14", title: "Reverse a stack using recursion", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-a-stack/1" },
        { id: "sq-15", title: "Sort a Stack using recursion", gfg_link: "https://www.geeksforgeeks.org/problems/sort-a-stack/1" },
        { id: "sq-16", title: "Merge Overlapping Intervals", gfg_link: "https://www.geeksforgeeks.org/problems/overlapping-intervals/0" },
        { id: "sq-17", title: "Largest rectangular Area in Histogram", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1" },
        { id: "sq-18", title: "Length of the Longest Valid Substring", gfg_link: "https://www.geeksforgeeks.org/problems/valid-substring0624/1" },
        { id: "sq-19", title: "Expression contains redundant bracket or not", gfg_link: "https://www.geeksforgeeks.org/problems/expression-contains-redundant-bracket-or-not/1" },
        { id: "sq-20", title: "Implement Stack using Queue", gfg_link: "https://www.geeksforgeeks.org/problems/stack-using-two-queues/1" },
        { id: "sq-21", title: "Implement Stack using Deque", gfg_link: "https://www.geeksforgeeks.org/dsa/implement-stack-queue-using-deque/" },
        { id: "sq-22", title: "Stack Permutations (Check if an array is stack permutation of other)", gfg_link: "https://www.geeksforgeeks.org/problems/stack-permutations/1" },
        { id: "sq-23", title: "Implement Queue using Stack", gfg_link: "https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1" },
        { id: "sq-24", title: "Implement \"n\" queue in an array", gfg_link: "https://www.geeksforgeeks.org/dsa/efficiently-implement-k-queues-single-array/" },
        { id: "sq-25", title: "Implement a Circular queue", gfg_link: "https://www.geeksforgeeks.org/dsa/introduction-to-circular-queue/" },
        { id: "sq-26", title: "LRU Cache Implementation", gfg_link: "https://www.geeksforgeeks.org/problems/lru-cache/1" },
        { id: "sq-27", title: "Reverse a Queue using recursion", gfg_link: "https://www.geeksforgeeks.org/problems/queue-reversal/1" },
        { id: "sq-28", title: "Reverse the first \"K\" elements of a queue", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1" },
        { id: "sq-29", title: "Interleave the first half of the queue with second half", gfg_link: "https://www.geeksforgeeks.org/problems/interleave-the-first-half-of-the-queue-with-second-half/1" },
        { id: "sq-30", title: "Find the first circular tour that visits all Petrol Pumps", gfg_link: "https://www.geeksforgeeks.org/problems/circular-tour-1587115620/1" },
        { id: "sq-31", title: "Minimum time required to rot all oranges", gfg_link: "https://www.geeksforgeeks.org/problems/rotten-oranges2536/1" },
        { id: "sq-32", title: "Distance of nearest cell having 1 in a binary matrix", gfg_link: "https://www.geeksforgeeks.org/problems/distance-of-nearest-cell-having-1-1587115620/1" },
        { id: "sq-33", title: "First negative integer in every window of size \"k\"", gfg_link: "https://www.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1" },
        { id: "sq-34", title: "Check if all levels of two trees are anagrams or not.", gfg_link: "https://www.geeksforgeeks.org/problems/check-if-all-levels-of-two-trees-are-anagrams-or-not/1" },
        { id: "sq-35", title: "Sum of minimum and maximum elements of all subarrays of size \"k\".", gfg_link: "https://www.geeksforgeeks.org/dsa/sum-minimum-maximum-elements-subarrays-size-k/" },
        { id: "sq-36", title: "Minimum sum of squares of character counts in a given string after removing \"k\" characters.", gfg_link: "https://www.geeksforgeeks.org/problems/game-with-string4100/1" },
        { id: "sq-37", title: "Queue based approach for first non-repeating character in a stream.", gfg_link: "https://www.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1" },
        { id: "sq-38", title: "Next Smaller Element", gfg_link: "https://www.geeksforgeeks.org/dsa/next-smaller-element/" },
      ],
    },
    {
      topic: "Binary Trees",
      count: 35,
      problems: [
        { id: "bintree-1", title: "Level order traversal", gfg_link: "https://www.geeksforgeeks.org/problems/level-order-traversal/1" },
        { id: "bintree-2", title: "Reverse Level Order traversal", gfg_link: "https://www.geeksforgeeks.org/problems/reverse-level-order-traversal/1" },
        { id: "bintree-3", title: "Height of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1" },
        { id: "bintree-4", title: "Diameter of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1" },
        { id: "bintree-5", title: "Mirror of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/mirror-tree/1" },
        { id: "bintree-6", title: "Inorder Traversal of a tree both using recursion and Iteration", gfg_link: "https://www.geeksforgeeks.org/dsa/tree-traversals-inorder-preorder-and-postorder/" },
        { id: "bintree-7", title: "Preorder Traversal of a tree both using recursion and Iteration", gfg_link: "https://www.geeksforgeeks.org/dsa/iterative-preorder-traversal/" },
        { id: "bintree-8", title: "Postorder Traversal of a tree both using recursion and Iteration", gfg_link: "https://www.geeksforgeeks.org/dsa/tree-traversals-inorder-preorder-and-postorder/" },
        { id: "bintree-9", title: "Left View of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1" },
        { id: "bintree-10", title: "Right View of Tree", gfg_link: "https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1" },
        { id: "bintree-11", title: "Top View of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1" },
        { id: "bintree-12", title: "Bottom View of a tree", gfg_link: "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1" },
        { id: "bintree-13", title: "Zig-Zag traversal of a binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1" },
        { id: "bintree-14", title: "Check if a tree is balanced or not", gfg_link: "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1" },
        { id: "bintree-15", title: "Diagonal Traversal of a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1" },
        { id: "bintree-16", title: "Boundary traversal of a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1" },
        { id: "bintree-17", title: "Construct Binary Tree from String with Bracket Representation", gfg_link: "https://www.geeksforgeeks.org/problems/construct-binary-tree-from-string-with-bracket-representation/1" },
        { id: "bintree-18", title: "Convert Binary tree into Doubly Linked List", gfg_link: "https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1" },
        { id: "bintree-19", title: "Convert Binary tree into Sum tree", gfg_link: "https://www.geeksforgeeks.org/problems/transform-to-sum-tree/1" },
        { id: "bintree-20", title: "Construct Binary tree from Inorder and preorder traversal", gfg_link: "https://www.geeksforgeeks.org/problems/construct-tree-1/1" },
        { id: "bintree-21", title: "Find minimum swaps required to convert a Binary tree into BST", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-swap-required-to-convert-binary-tree-to-binary-search-tree/1" },
        { id: "bintree-22", title: "Check if Binary tree is Sum tree or not", gfg_link: "https://www.geeksforgeeks.org/problems/sum-tree/1" },
        { id: "bintree-23", title: "Check if all leaf nodes are at same level or not", gfg_link: "https://www.geeksforgeeks.org/problems/leaf-at-same-level/1" },
        { id: "bintree-24", title: "Check if a Binary Tree contains duplicate subtrees of size 2 or more [IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/duplicate-subtree-in-binary-tree/1" },
        { id: "bintree-25", title: "Check if 2 trees are mirror or not", gfg_link: "https://www.geeksforgeeks.org/problems/check-mirror-in-n-ary-tree1528/1" },
        { id: "bintree-26", title: "Sum of Nodes on the Longest path from root to leaf node", gfg_link: "https://www.geeksforgeeks.org/problems/sum-of-the-longest-bloodline-of-a-tree/1" },
        { id: "bintree-27", title: "Check if given graph is tree or not. [IMP]", gfg_link: "https://www.geeksforgeeks.org/dsa/check-given-graph-tree/" },
        { id: "bintree-28", title: "Find Largest subtree sum in a tree", gfg_link: "https://www.geeksforgeeks.org/problems/largest-subtree-sum-in-a-tree/1" },
        { id: "bintree-29", title: "Maximum Sum of nodes in Binary tree such that no two are adjacent", gfg_link: "https://www.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1" },
        { id: "bintree-30", title: "Print all \"K\" Sum paths in a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/k-sum-paths/1" },
        { id: "bintree-31", title: "Find LCA in a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1" },
        { id: "bintree-32", title: "Find distance between 2 nodes in a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/min-distance-between-two-given-nodes-of-a-binary-tree/1" },
        { id: "bintree-33", title: "Kth Ancestor of node in a Binary tree", gfg_link: "https://www.geeksforgeeks.org/problems/kth-ancestor-in-a-tree/1" },
        { id: "bintree-34", title: "Find all Duplicate subtrees in a Binary tree [IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/duplicate-subtrees/1" },
        { id: "bintree-35", title: "Tree Isomorphism Problem", gfg_link: "https://www.geeksforgeeks.org/problems/check-if-tree-is-isomorphic/1" },
      ],
    },
    {
      topic: "Binary Search Tree",
      count: 22,
      problems: [
        { id: "bst-1", title: "Find a value in a BST", gfg_link: "https://www.geeksforgeeks.org/dsa/binary-search-tree-set-1-search-and-insertion/" },
        { id: "bst-2", title: "Deletion of a node in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/delete-a-node-from-bst/1" },
        { id: "bst-3", title: "Find min and max value in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-element-in-bst/1" },
        { id: "bst-4", title: "Find inorder successor and inorder predecessor in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/predecessor-and-successor/1" },
        { id: "bst-5", title: "Check if a tree is a BST or not", gfg_link: "https://www.geeksforgeeks.org/problems/check-for-bst/1" },
        { id: "bst-6", title: "Populate Inorder successor of all nodes", gfg_link: "https://www.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1" },
        { id: "bst-7", title: "Find LCA of 2 nodes in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1" },
        { id: "bst-8", title: "Construct BST from preorder traversal", gfg_link: "https://www.geeksforgeeks.org/dsa/construct-bst-from-given-preorder-traversa/" },
        { id: "bst-9", title: "Convert Binary tree into BST", gfg_link: "https://www.geeksforgeeks.org/problems/binary-tree-to-bst/1" },
        { id: "bst-10", title: "Convert a normal BST into a Balanced BST", gfg_link: "https://www.geeksforgeeks.org/problems/normal-bst-to-balanced-bst/1" },
        { id: "bst-11", title: "Merge two BST [V.V.V>IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/merge-two-bst-s/1" },
        { id: "bst-12", title: "Find Kth largest element in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1" },
        { id: "bst-13", title: "Find Kth smallest element in a BST", gfg_link: "https://www.geeksforgeeks.org/problems/find-k-th-smallest-element-in-bst/1" },
        { id: "bst-14", title: "Count pairs from 2 BST whose sum is equal to given value \"X\"", gfg_link: "https://www.geeksforgeeks.org/problems/brothers-from-different-root/1" },
        { id: "bst-15", title: "Find the median of BST in O(n) time and O(1) space", gfg_link: "https://www.geeksforgeeks.org/problems/median-of-bst/1" },
        { id: "bst-16", title: "Count BST nodes that lie in a given range", gfg_link: "https://www.geeksforgeeks.org/problems/count-bst-nodes-that-lie-in-a-given-range/1" },
        { id: "bst-17", title: "Replace every element with the least greater element on its right", gfg_link: "https://www.geeksforgeeks.org/problems/replace-every-element-with-the-least-greater-element-on-its-right/1" },
        { id: "bst-18", title: "Given \"n\" appointments, find the conflicting appointments", gfg_link: "https://www.geeksforgeeks.org/dsa/given-n-appointments-find-conflicting-appointments/" },
        { id: "bst-19", title: "Check preorder is valid or not", gfg_link: "https://www.geeksforgeeks.org/problems/preorder-to-postorder4423/1" },
        { id: "bst-20", title: "Check whether BST contains Dead end", gfg_link: "https://www.geeksforgeeks.org/problems/check-whether-bst-contains-dead-end/1" },
        { id: "bst-21", title: "Largest BST in a Binary Tree [V.V.V.V.V IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/largest-bst/1" },
        { id: "bst-22", title: "Flatten BST to sorted list", gfg_link: "https://www.geeksforgeeks.org/dsa/flatten-bst-to-sorted-list-increasing-order/" },
      ],
    },
    {
      topic: "Graphs",
      count: 43,
      problems: [
        { id: "graph-1", title: "Create a Graph, print it", gfg_link: "https://www.geeksforgeeks.org/dsa/graph-and-its-representations/" },
        { id: "graph-2", title: "Implement BFS algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1" },
        { id: "graph-3", title: "Implement DFS Algo", gfg_link: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1" },
        { id: "graph-4", title: "Detect Cycle in Directed Graph using BFS/DFS Algo", gfg_link: "https://www.geeksforgeeks.org/dsa/detect-cycle-in-a-graph/" },
        { id: "graph-5", title: "Detect Cycle in UnDirected Graph using BFS/DFS Algo", gfg_link: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1" },
        { id: "graph-6", title: "Search in a Maze", gfg_link: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
        { id: "graph-7", title: "Minimum Step by Knight", gfg_link: "https://www.geeksforgeeks.org/problems/steps-by-knight5927/1" },
        { id: "graph-8", title: "Flood fill algo", gfg_link: "https://www.geeksforgeeks.org/problems/flood-fill-algorithm1856/0" },
        { id: "graph-9", title: "Clone a graph", gfg_link: "https://www.geeksforgeeks.org/problems/clone-graph/1" },
        { id: "graph-10", title: "Making wired Connections", gfg_link: "https://www.geeksforgeeks.org/dsa/minimize-count-of-connections-required-to-be-rearranged-to-make-all-the-computers-connected/" },
        { id: "graph-11", title: "Word Ladder", gfg_link: "https://www.geeksforgeeks.org/problems/word-ladder/0" },
        { id: "graph-12", title: "Dijkstra algo", gfg_link: "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1" },
        { id: "graph-13", title: "Implement Topological Sort", gfg_link: "https://www.geeksforgeeks.org/problems/topological-sort/1" },
        { id: "graph-14", title: "Minimum time taken by each job to be completed given by a Directed Acyclic Graph", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-time-taken-by-each-job-to-be-completed-given-by-a-directed-acyclic-graph/1" },
        { id: "graph-15", title: "Find whether it is possible to finish all tasks or not from given dependencies", gfg_link: "https://www.geeksforgeeks.org/dsa/find-whether-it-is-possible-to-finish-all-tasks-or-not-from-given-dependencies/" },
        { id: "graph-16", title: "Find the no. of Islands", gfg_link: "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1" },
        { id: "graph-17", title: "Given a sorted Dictionary of an Alien Language, find order of characters", gfg_link: "https://www.geeksforgeeks.org/problems/alien-dictionary/1" },
        { id: "graph-18", title: "Implement Kruskal's Algorithm", gfg_link: "https://www.geeksforgeeks.org/dsa/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/" },
        { id: "graph-19", title: "Implement Prim's Algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
        { id: "graph-20", title: "Total no. of Spanning tree in a graph", gfg_link: "https://www.geeksforgeeks.org/dsa/total-number-spanning-trees-graph/" },
        { id: "graph-21", title: "Implement Bellman Ford Algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/negative-weight-cycle3504/1" },
        { id: "graph-22", title: "Implement Floyd Warshall Algorithm", gfg_link: "https://www.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1" },
        { id: "graph-23", title: "Travelling Salesman Problem", gfg_link: "https://www.geeksforgeeks.org/problems/travelling-salesman-problem2732/1" },
        { id: "graph-24", title: "Graph Colouring Problem", gfg_link: "https://www.geeksforgeeks.org/dsa/graph-coloring-applications/" },
        { id: "graph-25", title: "Snake and Ladders Problem", gfg_link: "https://www.geeksforgeeks.org/problems/snake-and-ladder-problem4816/1" },
        { id: "graph-26", title: "Find bridge in a graph", gfg_link: "https://www.geeksforgeeks.org/problems/bridge-edge-in-graph/1" },
        { id: "graph-27", title: "Count Strongly connected Components (Kosaraju Algo)", gfg_link: "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1" },
        { id: "graph-28", title: "Check whether a graph is Bipartite or Not", gfg_link: "https://www.geeksforgeeks.org/problems/bipartite-graph/1" },
        { id: "graph-29", title: "Detect Negative cycle in a graph", gfg_link: "https://www.geeksforgeeks.org/problems/negative-weight-cycle3504/1" },
        { id: "graph-30", title: "Longest path in a Directed Acyclic Graph", gfg_link: "https://www.geeksforgeeks.org/dsa/find-longest-path-directed-acyclic-graph/" },
        { id: "graph-31", title: "Journey to the Moon", secondary_link: "https://www.hackerrank.com/challenges/journey-to-the-moon/problem" },
        { id: "graph-32", title: "Cheapest Flights Within K Stops", gfg_link: "https://www.geeksforgeeks.org/dsa/shortest-path-exactly-k-edges-directed-weighted-graph/" },
        { id: "graph-33", title: "Oliver and the Game", secondary_link: "https://www.hackerearth.com/practice/algorithms/graphs/topological-sort/practice-problems/algorithm/oliver-and-the-game-3/" },
        { id: "graph-34", title: "Water Jug problem using BFS", gfg_link: "https://www.geeksforgeeks.org/problems/two-water-jug-problem3402/1" },
        { id: "graph-35", title: "Find if there is a path of more than k length from a source", gfg_link: "https://www.geeksforgeeks.org/dsa/find-if-there-is-a-path-of-more-than-k-length-from-a-source/" },
        { id: "graph-36", title: "M-Colouring Problem", gfg_link: "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
        { id: "graph-37", title: "Minimum edges to reverse to make path from source to destination", gfg_link: "https://www.geeksforgeeks.org/dsa/minimum-edges-reverse-make-path-source-destination/" },
        { id: "graph-38", title: "Paths to travel each nodes using each edge (Seven Bridges)", gfg_link: "https://www.geeksforgeeks.org/dsa/paths-travel-nodes-using-edgeseven-bridges-konigsberg/" },
        { id: "graph-39", title: "Vertex Cover Problem", gfg_link: "https://www.geeksforgeeks.org/problems/vertex-cover/1" },
        { id: "graph-40", title: "Chinese Postman or Route Inspection", gfg_link: "https://www.geeksforgeeks.org/dsa/chinese-postman-route-inspection-set-1-introduction/" },
        { id: "graph-41", title: "Number of Triangles in a Directed and Undirected Graph", gfg_link: "https://www.geeksforgeeks.org/problems/number-of-triangles/1" },
        { id: "graph-42", title: "Minimise the cashflow among a given set of friends who have borrowed money", gfg_link: "https://www.geeksforgeeks.org/problems/minimize-cash-flow/1" },
        { id: "graph-43", title: "Two Clique Problem", gfg_link: "https://www.geeksforgeeks.org/dsa/two-clique-problem-check-graph-can-divided-two-cliques/" },
      ],
    },
    {
      topic: "Heap",
      count: 18,
      problems: [
        { id: "heap-1", title: "Implement a Maxheap/MinHeap using arrays and recursion.", gfg_link: "https://www.geeksforgeeks.org/dsa/building-heap-from-array/" },
        { id: "heap-2", title: "Sort an Array using heap. (HeapSort)", gfg_link: "https://www.geeksforgeeks.org/problems/heap-sort/1" },
        { id: "heap-3", title: "Maximum of all subarrays of size k.", gfg_link: "https://www.geeksforgeeks.org/dsa/sliding-window-maximum-maximum-of-all-subarrays-of-size-k/" },
        { id: "heap-4", title: "\"K\" largest element in an array", gfg_link: "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1" },
        { id: "heap-5", title: "Kth smallest and largest element in an unsorted array", gfg_link: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
        { id: "heap-6", title: "Merge \"K\" sorted arrays. [IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1" },
        { id: "heap-7", title: "Merge 2 Binary Max Heaps", gfg_link: "https://www.geeksforgeeks.org/problems/merge-two-binary-max-heap0144/1" },
        { id: "heap-8", title: "Kth largest sum continuous subarrays", gfg_link: "https://www.geeksforgeeks.org/dsa/k-th-largest-sum-contiguous-subarray/" },
        { id: "heap-9", title: "Leetcode - reorganize strings", gfg_link: "https://www.geeksforgeeks.org/dsa/rearrange-characters-string-no-two-adjacent/" },
        { id: "heap-10", title: "Merge \"K\" Sorted Linked Lists [V.IMP]", gfg_link: "https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1" },
        { id: "heap-11", title: "Smallest range in \"K\" Lists", gfg_link: "https://www.geeksforgeeks.org/problems/find-smallest-range-containing-elements-from-k-lists/1" },
        { id: "heap-12", title: "Median in a stream of Integers", gfg_link: "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1" },
        { id: "heap-13", title: "Check if a Binary Tree is Heap", gfg_link: "https://www.geeksforgeeks.org/problems/is-binary-tree-heap/1" },
        { id: "heap-14", title: "Connect \"n\" ropes with minimum cost", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
        { id: "heap-15", title: "Convert BST to Min Heap", gfg_link: "https://www.geeksforgeeks.org/dsa/convert-bst-min-heap/" },
        { id: "heap-16", title: "Convert min heap to max heap", gfg_link: "https://www.geeksforgeeks.org/problems/convert-min-heap-to-max-heap-1666385109/1" },
        { id: "heap-17", title: "Rearrange characters in a string such that no two adjacent are same.", gfg_link: "https://www.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: "heap-18", title: "Minimum sum of two numbers formed from digits of an array", gfg_link: "https://www.geeksforgeeks.org/problems/minimum-sum4058/1" },
      ],
    },
    {
      topic: "Trie",
      count: 6,
      problems: [
        { id: "trie-1", title: "Construct a trie from scratch", gfg_link: "https://www.geeksforgeeks.org/dsa/trie-insert-and-search/" },
        { id: "trie-2", title: "Find shortest unique prefix for every word in a given list", gfg_link: "https://www.geeksforgeeks.org/problems/shortest-unique-prefix-for-every-word/1" },
        { id: "trie-3", title: "Word Break Problem | (Trie solution)", gfg_link: "https://www.geeksforgeeks.org/problems/word-break-trie--141631/1" },
        { id: "trie-4", title: "Given a sequence of words, print all anagrams together", gfg_link: "https://www.geeksforgeeks.org/problems/print-anagrams-together/1" },
        { id: "trie-5", title: "Implement a Phone Directory", gfg_link: "https://www.geeksforgeeks.org/problems/phone-directory4628/1" },
        { id: "trie-6", title: "Print unique rows in a given boolean matrix", gfg_link: "https://www.geeksforgeeks.org/problems/unique-rows-in-boolean-matrix/1" },
      ],
    },
  ],
};

export default function Sheet() {
  const [openTopics, setOpenTopics] = useState(() => new Set(["Arrays"]));
  const [search, setSearch] = useState("");

  const totalProblems = SHEET_DATA.total_problems;

  const toggleTopic = (topic) => {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SHEET_DATA.topics;
    return SHEET_DATA.topics
      .map((t) => ({
        ...t,
        problems: t.problems.filter((p) => p.title.toLowerCase().includes(q)),
      }))
      .filter((t) => t.problems.length > 0);
  }, [search]);

  // Auto-expand topics that have search matches
  const searchActive = search.trim().length > 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              DSA Sheet
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Love Babbar&apos;s curated list of {totalProblems} must-solve DSA problems
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">Total Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">{totalProblems}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {SHEET_DATA.total_topics} topics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">By Love Babbar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">Free</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Curated for interview preparation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Topics */}
          <div className="space-y-3">
            {filteredTopics.map((topicData) => {
              const isOpen = searchActive || openTopics.has(topicData.topic);

              return (
                <Card key={topicData.topic} className="overflow-hidden">
                  <button
                    className="w-full text-left"
                    onClick={() => toggleTopic(topicData.topic)}
                  >
                    <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <CardTitle className="text-base sm:text-lg truncate">
                            {topicData.topic}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {topicData.problems.length} problems
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </button>

                  {isOpen && (
                    <CardContent className="px-4 sm:px-6 pb-4 pt-0">
                      <div className="border rounded-lg overflow-hidden">
                        {topicData.problems.map((problem, idx) => {
                          const link = problem.gfg_link || problem.secondary_link;
                          return (
                            <div
                              key={problem.id}
                              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-accent/50 ${
                                idx !== topicData.problems.length - 1
                                  ? "border-b border-border"
                                  : ""
                              }`}
                            >
                              <span className="flex-1 text-xs sm:text-sm leading-snug text-foreground">
                                {problem.title}
                              </span>
                              {link ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0"
                                  aria-label="Open problem"
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    asChild
                                  >
                                    <span>
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </span>
                                  </Button>
                                </a>
                              ) : (
                                <span className="w-7 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="rounded-md border border-border bg-muted/20 p-12 text-center text-muted-foreground">
                No problems match &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
