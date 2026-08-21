import numpy as np
import matplotlib.pyplot as plt


def plot_elliptic_curve():

    x = np.linspace(-np.cbrt(7), 5, 1200)
    rhs = x**3 + 7

    mask = rhs >= 0
    x_valid = x[mask]
    y = np.sqrt(rhs[mask])

    plt.figure(figsize=(8, 6))

    plt.plot(x_valid, y, linewidth=2, label=r"$y=\sqrt{x^3+7}$")
    plt.plot(x_valid, -y, linewidth=2, label=r"$y=-\sqrt{x^3+7}$")

    plt.axhline(0, linewidth=0.8)
    plt.axvline(0, linewidth=0.8)

    plt.title(r"Real-valued analogue of secp256k1: $y^2=x^3+7$")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.xlim([-5, 8])
    plt.grid(True, alpha=0.3)
    plt.legend()
    #plt.gca().set_aspect("equal", adjustable="datalim")

    plt.tight_layout()


plot_elliptic_curve()
plt.savefig("light/elliptic-curve.svg", transparent=True)
plt.close()

plt.style.use("dark_background")
plot_elliptic_curve()
plt.savefig("dark/elliptic-curve.svg", transparent=True)
plt.close()
