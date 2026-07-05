---
layout: ../../../layouts/PostLayout.astro
title: TODO
description: TODO
date: TODO
author: TODO
lang: en
tag: GenAI
difficulty: 1
---

TODO


TTR (type-token ratio) is a lexical diversity metric, computed as the number of types (unique word roots) divided by the number of tokens.

| Feature | Description | Relationship with p(AI) | AUROC |
| ------- | ----------- | -------------------------- | ----- |
| Perplexity | Negative likelihood of the text according to a language model (e.g. GPT2) | - | ? |
| Contraction ratio | TODO | - | 0.5075 |
| Intensifier density | TODO | + | 0.5337 |
| Hedging density | TODO | + | 0.5651 |
| Modal density | TODO | + | 0.5272 |
| Deontic modal ratio | TODO | + | 0.6148 |
| Epistemic modal ratio | TODO | - | 0.5608 |
| Negation density | TODO | + | 0.6251 |
| Exclamation density | TODO | + | 0.5005 |
| Parenthetical density | TODO | + | 0.8749 |
| Ellipsis density | TODO | - | 0.5103 |
| Dash density | TODO | + | 0.5274 |
| Semicolon density | TODO | + | 0.6363 |
| Colon density | TODO | + | 0.5684 |
| Exclamation density | TODO | + | 0.5005 |
| Question density | TODO | - | 0.5031 |
| Quotation density | TODO | - | 0.8525 |
| Unigram entropy | TODO | + | 0.5123 |
| Pronoun density | TODO | + | 0.6384 |
| Demonstration density | TODO | ? | ? |
| Anaphora resolution ratio | TODO | ? | ? |
| Word repetition ratio | TODO | ? | ? |
| Connective density | TODO | ? | ? |
| Additive connective density | TODO | ? | ? |
| Adversative connective ratio | TODO | ? | ? |
| Causal connective ratio | TODO | ? | ? |
| Temporal connective ratio | TODO | ? | ? |
| Formality score | TODO | - | 0.5117 |
| Academic score | TODO | + | 0.6237 |
| Journalistic score | TODO | - | 0.7156 |
| Fiction score | TODO | - | 0.7123 |
| Legal score | TODO | + | 0.5784 |
| Conversational score | TODO | - | 0.6219 |
| Latinate ratio | TODO | - | 0.6941 |
| Nominalization density | TODO | - | 0.5798 |
| Passive voice density | TODO | + | 0.6786 |
| Narrative expository ratio | TODO | - | 0.6383 |
| American score purity | TODO | + | 0.5305 |
| Markedness score | TODO | - | 0.5192 |
| Eye dialect ratio | TODO | + | 0.5357 |
| voc-D | 

```python
results["vocd_d"] = compute_vocd_d(text).d_parameter  # 0.519232
results["1 - mattr_score"] = 1 - compute_mattr(text).mattr_score  # 0.6023595
results["hdd_score"] = compute_hdd(text).hdd_score  # 0.561731
results["msttr_score"] = 1 - compute_msttr(text).msttr_score  # 0.5098100000000001
out = compute_function_words(text)
results["determiner_ratio"] = out.determiner_ratio  # 0.726628
results["preposition_ratio"] = out.preposition_ratio  # 0.537029
results["1 - conjunction_ratio"] = 1 - out.conjunction_ratio  # 0.7427545
results["pronoun_ratio"] = out.pronoun_ratio  # 0.682042
results["auxiliary_ratio"] = out.auxiliary_ratio  # 0.7062495
results["1 - particle_ratio"] = 1 - out.particle_ratio  # 0.5387015
results["total_function_word_ratio"] = out.total_function_word_ratio  # 0.7539549999999999
results["1 - function_word_diversity"] = 1 - out.function_word_diversity  # 0.5569
out = compute_hapax_ratios(text)
results["hapax_ratio"] = out.hapax_ratio  # 0.6582265
results["1 - sichel_s"] = 1 - out.sichel_s  # 0.634791
results["honore_r"] = out.honore_r  # 0.7014589999999998
out = compute_mtld(text)
results["-mtld_forward"] = -out.mtld_forward  # 0.5797695
results["-mtld_backward"] = -out.mtld_backward  # 0.5903649999999999
results["-mtld_average"] = -out.mtld_average  # 0.586529
results["-repetitive_unigrams_slop_score"] = -compute_repetitive_unigrams(text).slop_score  # 0.573785
results["ttr"] = compute_ttr(text).ttr  # 0.5685505
out = compute_word_frequency_sophistication(text)
results["-mean_frequency_rank"] = -out.mean_frequency_rank  # 0.748536
results["1 - rare_word_ratio"] = 1 - out.rare_word_ratio  # 0.747913
results["1 - academic_word_ratio"] = 1 - out.academic_word_ratio  # 0.6303610000000001
results["1 - advanced_word_ratio"] = 1 - out.advanced_word_ratio  # 0.7515594999999999
out = compute_yule(text)
results["yule_k_dist_mean"] = out.yule_k_dist.mean  # 0.5779460000000001
results["yule_i_dist_mean"] = out.yule_i_dist.mean  # 0.535702
out = compute_pos_ratios(text)
results["noun_ratio"] = out.noun_ratio
results["verb_ratio"] = out.verb_ratio
results["adjective_ratio"] = out.adjective_ratio
results["adverb_ratio"] = out.adverb_ratio
```

https://titan.dcs.bbk.ac.uk/~roger/wikipedia.dat



The capybara problem [^1]

Binoculars [^1]

Ghostbuster [^2]


https://search.informit.org/doi/abs/10.3316/informit.T2025092000000692109204440
https://arxiv.org/pdf/2602.13042



[^1]: Hans, Abhimanyu, et al. "Spotting llms with binoculars: Zero-shot detection of machine-generated text." _arXiv preprint arXiv:2401.12070_ (2024).
[^2]: Verma, Vivek, et al. "Ghostbuster: Detecting text ghostwritten by large language models." _Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)._ 2024.