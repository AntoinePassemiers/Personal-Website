---
layout: ../../../layouts/PostLayout.astro
title: Pourquoi vous devriez arrêter la cross-validation par leave-one-out
description: Comment leave-one-out introduit des biais distributionnels dans vos données d'apprentissage
date: 2026-05-24
author: Antoine Passemiers
lang: fr
tag: Machine Learning
difficulty: 3
---

## Un exemple simple

Le morceau de code suivant effectue une simple cross-validation d'une machine à vecteurs de support (SVM) par leave-one-out (LOO) sur des données générées aléatoirement. Supposons que par hyper-optimisation automatique, génération par un LLM, par manque d'expérience ou à cause d'une erreur d'inattention de la part du développeur, le paramètre de régularisation est beaucoup plus faible qu'il ne devrait (`C=1e-6`):

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

La performance de cross-validation, telle que mesurée ici par le coefficient de corrélation de Matthews (MCC), est de 100%. Le code a été testé avec la version 1.6.1 de `scikit-learn` et la version 2.2.6 de `numpy`.

Tout data scientist (experimenté ou non) connaît le principe de la cross-validation, et est au fait des excellentes capacités de généralisation des SVM, en particulier en présence de forte régularisation. Il serait donc tenté de conclure que la SVM est la solution parfaite à son problème.

Dans mon exemple, les données ont été générées aléatoirement (pour que l'absurdité de la situation soit évidente pour tous), mais un jeu de vraies données pourrait tout autant faire l'affaire. Mais revenons au noeud de l'affaire : ces 100% de performance sont-ils réels? Et bien la réponse est non.

Si je modifie le code ci-dessus en randomisant `y_test` juste avant chaque appel à `model.predict`, le MCC retombe proche de 0, ce qui correspond effectivement à une performance aléatoire. Ceci montre bien que dans la version d'origine du code, la cross-validation se comporte de facon inattendue. On pourrait affirmer qu'il y a de l'information à propos des données de validation qui fuite systématiquement vers les données d'apprentissage. Pourtant, l'implémentation par `scikit-learn` guarantit l'absence de chevauchement entre les données d'apprentissage et de validation, et ce, à chaque itération de LOO. Alors, que s'est-il passé ?

En réalité, il y a bel et bien de l'information que LOO fournit accidentellement au modèle : la proportion d'exemples positifs dans le jeu de données d'apprentissage. Cette proportion, qui correspond à la probabilité *a priori* de la classe positive, est ici égale à 164/424 ou 165/424, en fonction de l'itération. Cette probabilité seule est suffisante pour identifier la classe de l'exemple unique présent dans le jeu de données de validation: 0 pour 165/424, et 1 pour 164/424. Pourtant, ceci n'explique toujours pas la performance maximale obtenue, puisque le modèle ne peut pas reposer sur cette probabilité *a priori* pour prédire. Alors, que se passe-t-il réellement ?

## La pondération des classes

Lorsque l'on regarde les coefficients linéaires de la SVM à chaque itération (le seul coefficient en réalité, puisqu'il n'y a qu'une seule variable explicative dans mon exemple), il apparaît que le coefficient est de l'ordre de `5e-6`, ce qui est négligeable, et dénonce un problème flagrant d'underfitting. On pouvait s'y attendre, étant donné le paramètre de régularisation particulièrement bas (`C=1e-6`).

Pour ce qui est du terme de biais, il est négatif (par exemple, `-1.00000081`) lorsque la probabilité *a priori* est de 165/424, et positif (par exemple, `0.99998697`) autrement.

Il y a en réalité une explication à tout ceci. Comme j'ai déclaré l'hyper-paramètre `class_weight='balanced'`, `scikit-learn` utilise la formule suivante pour déterminer la pondération des classes:
```python
class_weight = n_samples / (n_classes * np.bincount(y))
```
Le vecteur de poids est donc égal à `[0.8185328185, 1.2848484848]` lorsque la probabilité *a priori* est de 165/424, et `[0.8153846154, 1.2926829268]` dans l'autre cas.

`scikit-learn` passe ces pondérations à `libsvm`, qui les utilise pour définir les bornes supérieures sur les multiplicateurs de Lagrange: `C_i = class_weight[i] * C`.

Lors de l'apprentissage, `libsvm` minimise la fonction de Hinge ("Hinge loss"), qui est définie comme suit:
$$
\sum_i C_i \max(0, 1 - y_i f(x_i)),
$$
où $x_i$ est le vecteur (ici un scalaire) de variables explicatives, $y_i$ est la variable à prédire, $f$ est la fonction de décision de la SVM, et $C_i$ est la borne supérieure sur le multiplicateur de Lagrange $i$.

On sait déjà que la contribution des coefficients linéaires est négligeable, ce qui revient à dire que $f(x_i) \simeq b$, où $b$ est le terme de biais. En conséquence, le problème d'optimisation que `libsvm` cherche à résoudre est le suivant:
$$
\min_b \quad \sum_i C_i \max(0, 1 - y_i b).
$$

Supposons que $b \in [-1, 1]$, ce qui à une erreur numérique près, correspond à la réalité.
Ceci implique que lorsque $y_i = 1$, alors $\max(0, 1 - y_i b) = 1 - b$. De la même manière, lorsque $y_i = -1$, alors $\max(0, 1 - y_i b) = 1 + b$.
La fonction de Hinge devient alors:
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
où j'ai posé $C_i^+ = \sum_{i : y_i=1} C_i$ et $C_i^- = \sum_{i : y_i=-1} C_i$ pour alléger la notation. De la même manière, j'ai défini $n^+$ et $n^-$ comme étant les nombres d'exemples positifs et négatifs (dans le jeu de données d'apprentissage), respectivement.

On voit immédiatement que la fonction de Hinge ne dépend plus de $b$, et est constante dans l'intervalle $[-1, 1]$. En conclusion, toutes les solutions dans $[-1, 1]$ sont interchangeables. Jusqu'ici, nous avons prouvé pourquoi les solutions $b=-1$ et $b=1$ sont identiques et peuvent être choisies arbitrairement par le solveur de `libsvm`. Ce qu'il reste à démystifier est pourquoi le solveur a systématiquement choisi la solution $b=-1$ lorsque la probabilité *a priori* est de 165/424, et $b=1$ sinon.

## L'erreur numérique

Dans `libsvm`, le terme de biais est calculé sur base des points "libres":
[https://github.com/scikit-learn/scikit-learn/blob/bd0dbbd22ecf8e3198a40fc20694adc9435033f3/sklearn/svm/src/libsvm/svm.cpp#L1126](https://github.com/scikit-learn/scikit-learn/blob/bd0dbbd22ecf8e3198a40fc20694adc9435033f3/sklearn/svm/src/libsvm/svm.cpp#L1126).

Un point est dit "libre" lorsque le multiplicateur de Lagrange associé est strictement compris entre $0$ et $C_i$:
```c++
if(alpha[i] >= get_C(i))
    alpha_status[i] = UPPER_BOUND;
else if(alpha[i] <= 0)
    alpha_status[i] = LOWER_BOUND;
else alpha_status[i] = FREE;
```
Comme les valeurs $C_i$ sont très faibles, il y a de fortes chances que la majorité voire tous les $\alpha_i$ aient saturé. En revanche, les SVMs sont soumis à la contrainte suivante:
$$
\sum_i y_i \alpha_i = 0,
$$
ce qui implique probablement de retirer une valeur infinitésimale à au moins un des points $i$ pour satisfaire cette contrainte. Ce point devient alors un point libre, qui définira $b=1$ lorsque $y_i=1$, ou $b=-1$ lorsque $y_i=-1$.

À présent, nous savons que:
- La fonction de Hinge a grossièrement la même valeur pour $b=1$ et $b=-1$, rendant ces deux solutions interchangeables, à une erreur numérique près.
- La contrainte $\sum_i y_i \alpha_i = 0$ dépend des valeurs $y_i$.
- Les points libres sont déterminés par l'erreur numérique, et ce, de façon déterministe.

Nous pouvons en conclure que la valeur de $b$ dépend des valeurs $y_i$, et donc des valeurs $n$ et $n^+$ en résumé. Dans notre exemple précis, $b=-1$ lorsque $p=\frac{165}{424}$ et $b=1$ lorsque $p=\frac{164}{424}$, produisant un MCC de 100\%. Mais dans d'autres circonstances, la situation pourrait être toute autre:
- Si on remplace la valeur de `n_positives` par 98, alors le MCC devient -100\%, révélant une situation opposée au scénario de base: $b=1$ lorsque $p=\frac{98}{424}$ et $b=-1$ lorsque $p=\frac{97}{424}$. Ici, la performance est parfaitement et négativement corrélée avec la réalité.
- Si on remplace la valeur de `n` par 427, alors le MCC devient `nan`, car $b=1$ à la fois lorsque $p=\frac{165}{426}$ et lorsque $p=\frac{164}{426}$. Dans ce cas, il n'y a aucune corrélation entre les prédictions et la réalité.
- Si on remplace la valeur de `n` par 500, alors le MCC devient `nan`, car $b=-1$ à la fois lorsque $p=\frac{165}{499}$ et lorsque $p=\frac{164}{499}$. Dans ce cas, il n'y a aucune corrélation entre les prédictions et la réalité.

## Le problème s'étend à d'autres modèles

Mon exemple peut paraître artéfactuel voire complètement artificiel. Si vous pensez que ce phénomène de biais distributionnel ne pourra jamais vous affecter, détrompez-vous. Prenons un modèle plus simple, et une autre métrique de performance:

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

Ici, l'AUROC est de 0, ce qui correspond à une performance parfaitement et négativement corrélée à la réalité. En d'autres termes, il suffirait d'inverser les prédictions (ou de se tromper dans l'indiçage: `[:, 0]` au lieu de `[:, 1]`) pour obtenir une performance parfaite.

L'explication est ici beaucoup plus simple que pour la SVM: Naive Bayes prend directement et explicitement en compte les probabilités *a priori* dans son modèle:
$$
P(Y=1 | X) = \frac{P(Y=1) P(X | Y=1)}{P(X)},
$$
où $P(Y=1)$ est la probabilité *a priori* de la classe positive.
Pour ce qui est des deux autres facteurs dans la formule de Bayes:
- De par la loi des grands nombres et le caractère aléatoire de $X$, ou plus simplement car la presque intégralité des mêmes données est utilisée à chaque itération, la vraisemblance $P(X | Y=1)$ varie peu d'une itération à l'autre.
- Le facteur de normalisation $P(X)$ est constant car $X$ est constant.

$P(Y=1 | X)$ varie donc principalement suite aux variations de $P(Y=1)$, qui augmente lorsque la donnée de validation appartient à la classe négative, et inversément. Ceci explique la corrélation négative entre $Y$ et les prédictions faites par Naive Bayes.

## Ce qu'en dit la littérature

Ce problème, dans sa forme plus générale, pourrait se traduire par une corrélation négative entre les probabilités *a priori* des classes que l'on cherche à identifier, et la classe à laquelle appartient la donnée de validation. Notons que le problème ne se limite pas à la classification, puisque les problèmes de classification ne sont qu'un cas particulier de la régression, ou plutôt: tout problème de régression peut être réduit en problème de classification, en appliquant des seuils arbitraires à la variable expliquée afin de la rendre discrète (ou catégorielle). 

Quoi qu'il en soit, cette corrélation négative est pointée du doigt dans un papier récent de Austin et al.[^1], où les auteurs proposent une version revisitée de LOO, qu'ils appellent "rebalanced LOOCV".

Des simulations effectuées par Geroldinger et al. montrent que LOO est inadapté pour estimer l'aire sous la courbe ROC (AUROC, également appelé C-statistique), en particulier pour une régression logistique avec régularisation L2.[^2]

Bien plus tôt, Ron Kohavi avait déjà suggéré que la cross-validation stratifiée par 10-fold est plus adaptée que la cross-validation LOO pour estimer la précision d'un modèle, et ce lorsque le modèle sous-jacent est un arbre de décision (algorithme C4.5) ou un Naive Bayes.[^3]

Durant la même période, Jun Shao a trouvé un résultat théorique intéressant: la probabilité de sélectionner le meilleur modèle par cross-validation LOO ne converge pas vers 1 lorsque $n \rightarrow \infty$. Pour y parvenir, il faut exclure $n_v$ observations du jeu d'apprentissage, ce qui s'apparente à une cross-validation "leave-$n_v$-out", avec comme contrainte que $\frac{n_v}{n} \rightarrow 1$ lorsque $n \rightarrow \infty$.[^4]

En conclusion, garantir une taille suffisante pour le jeu de données de validation semble plus prudent, mais peut conduire à une variance plus élevée de l'estimation de la performance (précision, AUROC, etc.). Pour y remédier, une solution simple est de répéter la cross-validation plusieurs fois, ou de la coupler avec du bootstrapping.


[^1]: Austin, George I., Itsik Pe’er, and Tal Korem. "Distributional bias compromises leave-one-out cross-validation." _Science Advances_ 11.48 (2025): eadx6976.
[^2]: Geroldinger, Angelika, et al. "Leave-one-out cross-validation, penalization, and differential bias of some prediction model performance measures—a simulation study." _Diagnostic and Prognostic Research_ 7.1 (2023): 9.
[^3]: Kohavi, Ron. "A study of cross-validation and bootstrap for accuracy estimation and model selection." _Ijcai._ Vol. 14. No. 2. 1995.
[^4]: Shao, Jun. "Linear model selection by cross-validation." _Journal of the American statistical Association_ 88.422 (1993): 486-494.