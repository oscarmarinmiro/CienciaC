__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import copy

# REFERENCES
# https://www.cs.bu.edu/teaching/c/tree/breadth-first/

class BeginTree:
    def __init__(self):
        # Init the root node
        self.tree = {}
        self.tree["root"] = {'children': {}, 'average': 0, 'count': 0}

    def recalculate_counts(self):

        def go_down_count(name, node):

            if len(node['children']) > 0:
                node['count'] = 0

                for child_name, content in node['children'].items():
                    node['count']+= go_down_count(child_name, content)

                return node['count']
            else:
                return node['count']

        my_node = self.tree['root']

        go_down_count("root", my_node)

        return

    def insert_node_simple(self, path_vector, count, average):

        last = path_vector[-1]

        parents = path_vector[:-1]

        current_node = self.tree["root"]

        current_node['count'] += count



        for parent in parents:
            if 'children' not in current_node:
                current_node['children'] = {}
            if parent not in current_node['children']:
                current_node['children'][parent] = {'children': {}, "count": 0}
            current_node['children'][parent]['count'] += count

            current_node = current_node['children'][parent]

        # Last node from parents is our node

        if 'children' not in current_node:
            current_node['children'] = {}

        if last not in current_node['children']:
            current_node['children'][last] = {'count':0}

        current_node['children'][last]['count'] += count
        current_node['children'][last]['average'] = average


    def insert_node(self, path_vector, count, average):
        self.insert_node_simple(path_vector, count, average)

    def show_tree(self):
        pprint.pprint(self.tree)

    def get_tree_stats(self):

        depth_struct = {}

        def go_down_count(name, node, depth):

            if depth not in depth_struct:
                depth_struct[depth] = 0

            depth_struct[depth]+=1

            if len(node['children']) > 0:

                for child_name, content in node['children'].items():
                    go_down_count(child_name, content, depth+1)


        my_node = self.tree['root']

        go_down_count("root", my_node, 0)

        node_number = 0

        for index in depth_struct.keys():
            node_number += depth_struct[index]

        return depth_struct, node_number


    def tree_to_d3(self):

        def go_down(name, node):
            d3_node = {}

            if 'count' in node:
                d3_node['size'] = node['count']

            if 'average'in node:
                d3_node['average'] = node['average']

            d3_node['name'] = name
            d3_node['children'] = []

            if 'children' in node and len(node['children']) > 0:
                # del(d3_node['size'])
                for child_name, content in node['children'].items():
                    d3_node['children'].append(go_down(child_name, content))
                return d3_node
            else:
                del(d3_node['children'])
                return d3_node

        my_node = self.tree['root']

        my_struct = go_down("root", my_node)

        return my_struct

def main():

    print "Instantiating..."

    my_tree = BeginTree()

    print "Inserting..."

    my_tree.insert_node(["A","B","C","D"], 4, 0.5)
    my_tree.insert_node(["A","B","H","I"], 4, 0.5)
    my_tree.insert_node(["F","A"], 10, 0.5)

    print "Printing..."

    my_tree.show_tree()

    print "Converting..."

    d3_tree = my_tree.tree_to_d3()

    pprint.pprint(d3_tree)

    my_tree.show_tree()
    #
    # print "Converting..."
    #
    # pprint.pprint(my_tree.tree_to_d3())
    #
    # print "Stats..."
    #
    # pprint.pprint(my_tree.get_tree_stats())

if __name__ == "__main__":
    main()



