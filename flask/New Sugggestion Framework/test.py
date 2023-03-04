import matplotlib.pyplot as plt

l = [[1],[2],[4,-1],[5],[]]
a, b = zip(*[i+[0, 0][:abs(len(i)-2)] for i in l]) 
time=[1,2,3,4,5]
plt.bar(list(range(len(l))), a, 0.5, color='#d62728', yerr=time, label='variable line')
plt.bar(list(range(len(l))), b, 0.5, bottom=a, yerr=time, label='3D surface')
plt.ylabel('coordinates')
plt.xlabel('time')
plt.legend(loc='upper left')
plt.show()