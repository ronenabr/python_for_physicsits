# -*- coding: utf-8 -*-

# Double pendulum formula translated from the C code at
# http://www.physics.usyd.edu.au/~wheat/dpend_html/solve_dpend.c
# Taken from http://matplotlib.org/examples/animation/double_pendulum_animated.html

from numpy import sin, cos, pi, array
import numpy as np
import matplotlib.pyplot as plt
import scipy.integrate as integrate
import matplotlib.animation as animation

g =  9.8 # acceleration due to gravity, in m/s^2
L1 = 1.0 # length of pendulum 1 in m
L2 = 1.0 # length of pendulum 2 in m
M1 = 1.0 # mass of pendulum 1 in kg
M2 = 1.0 # mass of pendulum 2 in kg


from numpy import cos, sin, pi
def derivs(state, t):
    
    #unpack values
    (th1, w1, th2, w2) = state
    
    
    dth1_dt = w1
    
    del_ = th2-th1 
    den1 = (M1+M2)*L1 - M2*L1*cos(del_)*cos(del_)
    dw1_dt = (M2*L1*w1*w1*sin(del_)*cos(del_)
               + M2*g*sin(th2)*cos(del_) + M2*L2*w2*w2*sin(del_)
               - (M1+M2)*g*sin(th1))/den1
    
    dth2_dt = w2
    
    den2 = (L2/L1)*den1
    dw2_dt = (-M2*L2*w2*w2*sin(del_)*cos(del_)
               + (M1+M2)*g*sin(th1)*cos(del_)
               - (M1+M2)*L1*w1*w1*sin(del_)
               - (M1+M2)*g*sin(th2))/den2
    
    #return value
    dstate_dt = np.array([dth1_dt, dw1_dt, dth2_dt, dw2_dt])
    return dstate_dt

# create a time array from 0..100 sampled at 0.1 second steps
dt = 0.05
t = np.arange(0.0, 20, dt)

# th1 and th2 are the initial angles (degrees)
# w10 and w20 are the initial angular velocities (degrees per second)
th1 = 120.0
w1 = 0.0
th2 = -10.0
w2 = 0.0

rad = pi/180

# initial state
state = np.array([th1, w1, th2, w2])*pi/180.

# integrate your ODE using scipy.integrate.
y = integrate.odeint(derivs, state, t)

x1 = L1*sin(y[:,0])
y1 = -L1*cos(y[:,0])

x2 = L2*sin(y[:,2]) + x1
y2 = -L2*cos(y[:,2]) + y1

fig = plt.figure()
ax = fig.add_subplot(111, autoscale_on=False, xlim=(-2, 2), ylim=(-2, 2))
ax.grid()

line, = ax.plot([], [], 'o-', lw=2)
time_template = 'time = %.1fs'
time_text = ax.text(0.05, 0.9, '', transform=ax.transAxes)

def init():
    line.set_data([], [])
    time_text.set_text('')
    return line, time_text

def animate(i):
    thisx = [0, x1[i], x2[i]]
    thisy = [0, y1[i], y2[i]]

    line.set_data(thisx, thisy)
    time_text.set_text(time_template%(i*dt))
    return line, time_text

ani = animation.FuncAnimation(fig, animate, np.arange(1, len(y)),
    interval=25, blit=True, init_func=init)

#ani.save('double_pendulum.mp4', fps=15, clear_temp=True)
plt.show()
