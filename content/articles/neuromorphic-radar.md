---
title: "Neuromorphic Radar"
excerpt: "Event-driven acquisition of FMCW radar signals for ranging and imaging."
date: "2026-04-20"
updatedDate: "2026-04-20"
authors: [{"name":"Abijith J. Kamath","href":"https://kamath-abhijith.github.io"},{"name":"Ayush Jha"},{"name":"Dhanasekaran Balasubramanian"}]
---
![Neuromorphic Unlimited Sampling banner showing high-dynamic range signal acquisition](/assets/img/research-highlights/nus/nus-banner-800.webp)

Our goal for the last few years has been to develop co-designed techniques, where the hardware is designed to break conventional barriers of sensing, and the algorithms are tailored for a specific task. The neuromorphic radar is a co-designed technique where we use a neuromorphic encoder to make opportunistic measurements to reduce the overall sampling rate and develop novel algorithms for ranging or imaging taking into consideration the new hardware design.

In this article, we present our work on neuromorphic radar for ranging that enables accurate range estimation using an event-driven sampling architecture and sparse-signal recovery algorithms with as much as 10x reduction in the overall number of measurements. Our hardware prototype is coupled with the MIT Coffee Can Radar front end \[charvat2011mit\] that enables ranging with a resolution of 1 metre.

## An Introduction to FMCW Radars

![Fig. 1: A typical single element front-end setup for an FMCW radar for ranging. The transmit signal is linear frequency mo...](/assets/img/research-highlights/neu-rad/signal-flow-800.webp)

_Fig. 1: A typical single element front-end setup for an FMCW radar for ranging. The transmit signal is linear frequency modulated chirp signal with a known bandwidth. The signal that is acquired is a sum of beat frequencies, each corresponding to the range of a different target._

In radar ranging, one transmits a known signal and estimates the range of discrete targets using the round-trip delay between transmission and reception. However, since typical radar signals have high frequencies, acquisition of the radar echoes is challenging — the Shannon sampling requirement becomes prohibitive. In FMCW radar, the trick is to use an analog mixer in order to convert the round-trip delays to a proportional frequencies. Then, the “dechirped” signal, i.e., the output of the mixer has a lower overall bandwidth and therefore a lower Shannon sampling requirement. Then, range estimation is simply a problem of frequency estimation problem.

Here are the specifics. Consider transmit signals of the form

$$s_{\mathsf{TX}}(t)=\cos(2\pi f(t))$$

where $f(t)=f_0 t + \dfrac12 St^2$. The frequency modulation in the transmit signal is linear. Assuming a simple single-bounce reflection model, the reflected signal

$$s_{\mathsf{RX}}(t)=\displaystyle\sum_{k=1}^K c_ks_{\mathsf{TX}}(t-\tau_k)$$

where $c_k$ denotes the attenuation coefficient and $\tau_k$ denotes the round-trip delay corresponding to the $k$th target. Using the structure of the transmit signal and some basic trigonometry, we can show that the signal $s(t)$, which is the result of the output of the mixer $s_\mathsf{TX}(t)s_\mathsf{RX}(t)$ processed using a lowpass filter $g$, can be written as

$$s(t)=\displaystyle\sum_{k=1}^K a_k \cos(2\pi f_k t - \phi_k)$$

Here, $f_k$ is called a beat frequency that is proportional to the round-trip delay as $f_k = S\tau_k$, and in turn, the round-trip delay is related to the distance $d_k$ of the target as $\tau_k=\dfrac{2d_k}{c}$, where $c$ denotes the speed of light.

In a conventional radar, the frequencies are estimated from uniform samples of the signal $s(t)$ using the fast Fourier transform algorithm. Note that the whole setup does not take into special consideration the structure of the signals that are involved, neither the hardware nor the algorithms. In particular, the signal to be acquired is sparse or compressible in the Fourier domain, i.e., the output of the fast Fourier transform is essentially a stream of Dirac impulses. This motivates our neuromorphic radar.

## Co-Design for FMCW Ranging

In a neuromorphic radar, we use the structure on the signal $s(t)$ to co-design the hardware and the estimation algorithm. On the hardware front, we replace the analog-to-digital converter (ADC) in a conventional radar to a neuromorphic encoder that makes opportunistic measurements, therefore reducing the number of measurements below Shannon’s sampling requirement. This changes the representation of the signal on the computer and demands a different estimation technique. Using the fact that the signal is sparse/compressible in the Fourier domain, we use a sparse recovery technique for frequency estimation.

![Fig. 2: Event-driven radar ranging test bench using the MIT Coffee Can Radar front-end. We use our hardware prototype neur...](/assets/img/research-highlights/neu-rad/mit-front-end-800.webp)

_Fig. 2: Event-driven radar ranging test bench using the MIT Coffee Can Radar front-end. We use our hardware prototype neuromorphic encoder to acquire the dechirped signal in the form of events._

A neuromorphic encoder is a signal acquisition device that replaces an ADC. In a neuromorphic encoder, the continuous-time signal is encoded using a sequence of spikes, called _events_, which can be succinctly represented using the spike polarity and timing information. These spikes are generated only when there is a significant change in the signal. Specifically, when the signal changes by a constant threshold $C>0$, the encoder generates a spike with the corresponding polarity. What is interesting is the fact that the encoder will not make any measurements when there is no change in the signal. Therefore, when there are no targets, the radar will not make any measurements! On the contrary, a conventional radar will continue making measurements no matter the presence of a target. We call this feature _opportunistic sensing_.

More precisely, the continuous-time signal $s(t)$ is mapped to a sequence of spikes $p(t)=\displaystyle\sum_{m=1}^M p_m\delta(t-t_m)$, where

$$t_m = \displaystyle\min_{t>t_{m-1}} |s(t)-s(t_{m-1})| > C$$ $$p_m = \text{sgn}(s(t_m)-s(t_{m-1})$$

The encoding of the signal $s(t)$ is the sequence $\{(t_m, p_m)\}$. Most often, the number of measurements is far less than the Shannon sampling requirement. Further, the time instants are nonuniform and makes the reconstruction problem challenging.

For reconstruction, we leverage the sparse structure of the underlying signal in the Fourier domain. Measurements of the dechirped signal in the form of events can be converted to nonuniform samples of the signal using the $t$-transform for the neuromorphic encoder \[kamath2023neuromorphic\]. Then, we use a sparse recovery technique for estimation of the frequencies. For specific details and the reconstruction algorithm, refer to \[jha2026event\].

We use the MIT Coffee Can radar \[charvat2011mit\] to demonstrate event-driven ranging. The radar front end consists of paint cans that are repurposed as antennas for transmission and reception of the radar chirp and the echoes respectively. The front end interfaces with an Arduino microcontroller that allows setting the bandwidth and exciting the voltage-controlled oscillator for chirp generation. The Arduino also samples the dechirped signal at a uniform sampling rate of 44 kHz that allows a maximum range of about 500 m. The uniform samples are sent to a computer for processing. We use this as the baseline for comparison. Our hardware prototype encoder consists of a neuromorphic encoder that interfaces with a Raspberry Pi Pico microcontroller. The role of the microcontroller is to encode the spike train as a sequence of polarity and time instants, which are then interfaced with the computer for processing.

In contrast to a conventional radar, the processing requirements are significantly higher, while the neuromorphic radar requires a sophisticated iterative technique, a conventional radar uses the fast Fourier transform that runs of efficient firmware. The advantage of using the neuromorphic encoder is that the total number of measurements is far less than the Shannon requirement. See the live demonstration below!

{% youtube eWbHf62ew6k %}

Event-driven ranging using our hardware prototype and the MIT Coffee Can radar front end. The co-designed technique for ranging demonstrates accurate ranging with over 10x reduction in the number of measurements.
