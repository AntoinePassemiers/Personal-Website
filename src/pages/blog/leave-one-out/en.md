---
layout: ../../../layouts/PostLayout.astro
title: Why You Should Stop Using Leave-One-Out Cross-Validation
description: How leave-one-out introduces distributional biases into your training data
date: 2026-05-24
author: Antoine Passemiers
lang: en
tag: Machine Learning
difficulty: 3
---

## A simple example

The following piece of code performs a simple leave-one-out (LOO) cross-validation of a support vector machine (SVM) on randomly generated data. Let us assume that, because of automatic hyperparameter optimization, LLM-generated code, lack of experience, or a careless mistake on the developer’s part, the regularization parameter is much lower than it should be (`C=1e-6`):


```python
from sklearn.model_selection import LeaveOneOut
from sklearn.svm import SVC
from sklearn.metrics import confusion_matrix
import numpy as np
import tqdm


# Generate random dataset
n = 425
n_positives = 165
np.random.seed(0)
X = np.random.rand(n, 1)
y = np.zeros(n, dtype=int)
y[:n_positives] = 1
np.random.shuffle(y)

# Define model
model = SVC(
    kernel='linear',
    C=1e-6,
    gamma='scale',
    class_weight='balanced'
)

# Perform LOO cross-validation
loo = LeaveOneOut()
y_pred, y_target = list(), list()
for k, (train_index, test_index) in tqdm.tqdm(list(enumerate(loo.split(X, y)))):
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    model.fit(X_train, y_train)
    y_pred.append(model.predict(X_test))
    y_target.append(y_test[0])

# Compute performance metric
tn, fp, fn, tp = confusion_matrix(
    y_target,
    y_pred,
    labels=[0, 1]).ravel()
mcc = float(tp*tn-fp*fn)/np.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn))
print('MCC : %f' % mcc)
```

The cross-validation performance, measured here by the Matthews correlation coefficient (MCC), is 100%. The code was tested with version 1.6.1 of `scikit-learn` and version 2.2.6 of `numpy`.

Every data scientist, experienced or not, knows the principle of cross-validation, and is aware of the excellent generalization capabilities of SVMs, especially under strong regularization. They would therefore be tempted to conclude that the SVM is the perfect solution to their problem.

In my example, the data was generated randomly (so that the absurdity of the situation is obvious to everyone), but a real dataset could just as well do the trick. But let us get back to the heart of the matter: is this 100% performance real? Well, the answer is no.

If I modify the code above by randomizing `y_test` just before each call to `model.predict`, the MCC drops back close to 0, which indeed corresponds to random performance. This clearly shows that, in the original version of the code, cross-validation behaves in an unexpected way. One could argue that information about the validation data is systematically leaking into the training data. And yet, the `scikit-learn` implementation guarantees that there is no overlap between the training and validation data, at every LOO iteration. So what happened?

In reality, there is indeed information that LOO accidentally provides to the model: the proportion of positive examples in the training dataset. This proportion, which corresponds to the *prior* probability of the positive class, is here equal to 164/424 or 165/424, depending on the iteration. This probability alone is enough to identify the class of the single example present in the validation dataset: 0 for 165/424, and 1 for 164/424. Yet this still does not explain the maximum performance obtained, since the model cannot rely on this *prior* probability to make its prediction. So what is really going on?

## Class weighting

When we look at the linear coefficients of the SVM at each iteration (in fact, the only coefficient, since there is only one explanatory variable in my example), it turns out that the coefficient is on the order of `5e-6`, which is negligible, and exposes a glaring underfitting problem. This was to be expected, given the particularly low regularization parameter (`C=1e-6`).

As for the bias term, it is negative (for example, `-1.00000081`) when the *prior* probability is 165/424, and positive (for example, `0.99998697`) otherwise.

There is, in fact, an explanation for all this. Since I declared the hyperparameter `class_weight='balanced'`, `scikit-learn` uses the following formula to determine the class weights:

```python
class_weight = n_samples / (n_classes * np.bincount(y))
```

The weight vector is therefore equal to `[0.8185328185, 1.2848484848]` when the *prior* probability is 165/424, and `[0.8153846154, 1.2926829268]` in the other case.

`scikit-learn` passes these weights to `libsvm`, which uses them to define the upper bounds on the Lagrange multipliers: `C_i = class_weight[i] * C`.

During training, `libsvm` minimizes the Hinge loss, which is defined as follows:

$$
\sum_i C_i \max(0, 1 - y_i f(x_i)),
$$

where $x_i$ is the vector (here a scalar) of explanatory variables, $y_i$ is the variable to predict, $f$ is the SVM decision function, and $C_i$ is the upper bound on Lagrange multiplier $i$.

We already know that the contribution of the linear coefficients is negligible, which amounts to saying that $f(x_i) \simeq b$, where $b$ is the bias term. Consequently, the optimization problem that `libsvm` seeks to solve is the following:

$$
\min_b \quad \sum_i C_i \max(0, 1 - y_i b).
$$

Suppose that $b \in [-1, 1]$, which, up to numerical error, corresponds to reality.
This implies that when $y_i = 1$, then $\max(0, 1 - y_i b) = 1 - b$. Likewise, when $y_i = -1$, then $\max(0, 1 - y_i b) = 1 + b$.
The Hinge loss then becomes:

$$
\begin{aligned}
\sum_i C_i \max(0, 1 - y_i b) & = \sum_{i : y_i=1} C_i (1 - b) + \sum_{i : y_i=-1} C_i (1 + b) \\
& = C_i^+ (1 - b) + C_i^- (1 + b) \\
& = C_i^+ + C_i^- + b (C_i^- - C_i^+) \\
& = C_i^+ + C_i^- + b \left(\sum_{i : y_i=-1} \frac{n^+ + n^-}{2 n^-}C - \sum_{i : y_i=1} \frac{n^+ + n^-}{2 n^+}C\right) \\
& = C_i^+ + C_i^- + b \left(n^- \frac{n^+ + n^-}{2 n^-}C - n^+ \frac{n^+ + n^-}{2 n^+}C\right) \\
& = C_i^+ + C_i^- + b \left(\frac{n^+ + n^-}{2}C - \frac{n^+ + n^-}{2}C\right) \\
& = C_i^+ + C_i^- \\
\end{aligned},
$$

where I have set $C_i^+ = \sum_{i : y_i=1} C_i$ and $C_i^- = \sum_{i : y_i=-1} C_i$ to lighten the notation. Similarly, I have defined $n^+$ and $n^-$ as the numbers of positive and negative examples (in the training dataset), respectively.

We immediately see that the Hinge loss no longer depends on $b$, and is constant over the interval $[-1, 1]$. In conclusion, all solutions in $[-1, 1]$ are interchangeable. So far, we have proved why the solutions $b=-1$ and $b=1$ are identical and can be chosen arbitrarily by the `libsvm` solver. What remains to be demystified is why the solver systematically chose the solution $b=-1$ when the *prior* probability is 165/424, and $b=1$ otherwise.

## Numerical error

In `libsvm`, the bias term is computed based on the “free” points:
[https://github.com/scikit-learn/scikit-learn/blob/bd0dbbd22ecf8e3198a40fc20694adc9435033f3/sklearn/svm/src/libsvm/svm.cpp#L1126](https://github.com/scikit-learn/scikit-learn/blob/bd0dbbd22ecf8e3198a40fc20694adc9435033f3/sklearn/svm/src/libsvm/svm.cpp#L1126).

A point is said to be “free” when the associated Lagrange multiplier lies strictly between $0$ and $C_i$:

```c++
if(alpha[i] >= get_C(i))
    alpha_status[i] = UPPER_BOUND;
else if(alpha[i] <= 0)
    alpha_status[i] = LOWER_BOUND;
else alpha_status[i] = FREE;
```

Since the values of $C_i$ are very small, there is a high chance that most, if not all, of the $\alpha_i$ values have saturated. However, SVMs are subject to the following constraint:

$$
\sum_i y_i \alpha_i = 0,
$$

which probably implies subtracting an infinitesimal value from at least one of the points $i$ in order to satisfy this constraint. That point then becomes a free point, which will define $b=1$ when $y_i=1$, or $b=-1$ when $y_i=-1$.

We now know that:

- The Hinge loss has roughly the same value for $b=1$ and $b=-1$, making these two solutions interchangeable, up to numerical error.
- The constraint $\sum_i y_i \alpha_i = 0$ depends on the values $y_i$.
- Free points are determined by numerical error, and in a deterministic way.

We can conclude that the value of $b$ depends on the values $y_i$, and therefore, in summary, on the values of $n$ and $n^+$. In our specific example, $b=-1$ when $p=\frac{165}{424}$ and $b=1$ when $p=\frac{164}{424}$, producing an MCC of 100%. But under other circumstances, the situation could be quite different:

- If we replace the value of `n_positives` with 98, then the MCC becomes -100%, revealing a situation opposite to the baseline scenario: $b=1$ when $p=\frac{98}{424}$ and $b=-1$ when $p=\frac{97}{424}$. Here, performance is perfectly and negatively correlated with reality.
- If we replace the value of `n` with 427, then the MCC becomes `nan`, because $b=1$ both when $p=\frac{165}{426}$ and when $p=\frac{164}{426}$. In this case, there is no correlation between the predictions and reality.
- If we replace the value of `n` with 500, then the MCC becomes `nan`, because $b=-1$ both when $p=\frac{165}{499}$ and when $p=\frac{164}{499}$. In this case, there is no correlation between the predictions and reality.

## The problem extends to other models

My example may seem artifact-laden, even completely artificial. If you think this phenomenon of distributional bias could never affect you, think again. Let us take a simpler model, and another performance metric:

```python
from sklearn.model_selection import LeaveOneOut
from sklearn.naive_bayes import BernoulliNB
from sklearn.metrics import roc_auc_score
import numpy as np
import tqdm


# Generate random dataset
n = 425
n_positives = 165
np.random.seed(0)
X = np.random.rand(n, 1)
y = np.zeros(n, dtype=int)
y[:n_positives] = 1
np.random.shuffle(y)

# Define model
model = BernoulliNB()

# Perform LOO cross-validation
loo = LeaveOneOut()
y_pred, y_target = list(), list()
for k, (train_index, test_index) in tqdm.tqdm(list(enumerate(loo.split(X, y)))):
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    model.fit(X_train, y_train)
    y_pred.append(model.predict_proba(X_test)[:, 1])
    y_target.append(y_test[0])

# Compute performance metric
print('AUROC : %f' % roc_auc_score(y_target, y_pred))
```

Here, the AUROC is 0, which corresponds to performance that is perfectly and negatively correlated with reality. In other words, simply inverting the predictions (or making an indexing mistake: `[:, 0]` instead of `[:, 1]`) would be enough to obtain perfect performance.

The explanation here is much simpler than for the SVM: Naive Bayes directly and explicitly takes *prior* probabilities into account in its model:

$$
P(Y=1 | X) = \frac{P(Y=1) P(X | Y=1)}{P(X)},
$$

where $P(Y=1)$ is the *prior* probability of the positive class.
As for the two other factors in Bayes’ formula:

- By the law of large numbers and the random nature of $X$, or more simply because almost exactly the same data is used at every iteration, the likelihood $P(X | Y=1)$ varies little from one iteration to the next.
- The normalization factor $P(X)$ is constant because $X$ is constant.

$P(Y=1 | X)$ therefore varies mainly as a result of variations in $P(Y=1)$, which increases when the validation example belongs to the negative class, and vice versa. This explains the negative correlation between $Y$ and the predictions made by Naive Bayes.

## What the literature says

This problem, in its more general form, could be described as a negative correlation between the *prior* probabilities of the classes we are trying to identify, and the class to which the validation example belongs. Note that the problem is not limited to classification, since classification problems are only a special case of regression, or rather: any regression problem can be reduced to a classification problem by applying arbitrary thresholds to the explained variable in order to make it discrete (or categorical).

In any case, this negative correlation is called out in a recent paper by Austin et al.[^1], where the authors propose a revisited version of LOO, which they call “rebalanced LOOCV”.

Simulations performed by Geroldinger et al. show that LOO is unsuitable for estimating the area under the ROC curve (AUROC, also called the C-statistic), especially for logistic regression with L2 regularization.[^2]

Much earlier, Ron Kohavi had already suggested that stratified 10-fold cross-validation is more appropriate than LOO cross-validation for estimating a model’s accuracy, when the underlying model is a decision tree (the C4.5 algorithm) or Naive Bayes.[^3]

During the same period, Jun Shao found an interesting theoretical result: the probability of selecting the best model by LOO cross-validation does not converge to 1 as $n \rightarrow \infty$. To achieve this, one must exclude $n_v$ observations from the training dataset, which resembles “leave-$n_v$-out” cross-validation, with the constraint that $\frac{n_v}{n} \rightarrow 1$ as $n \rightarrow \infty$.[^4]

In conclusion, guaranteeing a sufficiently large validation dataset seems more prudent, but can lead to higher variance in the performance estimate (accuracy, AUROC, etc.). To remedy this, a simple solution is to repeat cross-validation several times, or to combine it with bootstrapping.


[^1]: Austin, George I., Itsik Pe’er, and Tal Korem. "Distributional bias compromises leave-one-out cross-validation." _Science Advances_ 11.48 (2025): eadx6976.
[^2]: Geroldinger, Angelika, et al. "Leave-one-out cross-validation, penalization, and differential bias of some prediction model performance measures—a simulation study." _Diagnostic and Prognostic Research_ 7.1 (2023): 9.
[^3]: Kohavi, Ron. "A study of cross-validation and bootstrap for accuracy estimation and model selection." _Ijcai._ Vol. 14. No. 2. 1995.
[^4]: Shao, Jun. "Linear model selection by cross-validation." _Journal of the American statistical Association_ 88.422 (1993): 486-494.